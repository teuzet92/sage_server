function getNodeByDefinition(schema, stringAddress) {
	let address = stringAddress.split('/');
	address.shift(); // В начале всегда идет решетка
	return objget(schema, ...address);
}

function typedefFromSchema(schema) {
	if (schema.id) return;
	let schemaType = schema.type;
	if (schemaType == 'number') {
		return { // Дробное число
			name: 'number'
		};
	}
	if (schemaType == 'integer') {
		if (schema.link) {
			return {
				name: 'clink',
				templateId: schema.link,
			}
		}
		return {
			name: 'number',
			integer: true
		}
	}
	if (schemaType == 'array') {
		return {
			name: 'array',
			valueType: typedefFromSchema(schema.items),
		};
	}
	if (schemaType == 'string') {
		if (schema.color) {
			return {
				name: 'color'
			};
		}
		if (schema.enum) {
			// TODO
			return {
				name: 'enum',
				values: schema.enum,
			};
		}
		if (schema.script) {
			return {
				name: 'script',
				language: 'rhai',
			};
		}
		if (schema.webp_url) {
			return {
				name: 'resource',
				resourceType: 'webp',
			};
		}
		return {
			name: 'string',
			translated: schema.i18_text,
		};
	}
	if (schemaType == 'object') {
		let fieldCodes = schema.required;
		let fields = [];
		for (let fieldCode of fieldCodes) {
			let fieldSchema = schema.properties[fieldCode];
			let fieldTypedef = typedefFromSchema(fieldSchema);
			if (fieldTypedef) {
				fields.push({
					code: fieldCode,
					title: fieldSchema.title,
					description: fieldSchema.description,
					type: fieldTypedef,
				});
			}
		}
		return {
			name: 'struct',
			fields,
		};
	}
}

function templateFromSchema(schema) {
	if (schema.type != 'object' && schema.type != 'array') { // Игнорируем все странное
		return;
	}
	let properties = schema;
	if (schema.type == 'object') {
		var isSingleton = true;
	} else {
		properties = schema.items;
	}
	let fieldCodes = properties.required;
	let fields = [];
	for (let fieldCode of fieldCodes) {
		let fieldSchema = properties.properties[fieldCode];
		let fieldTypedef = typedefFromSchema(fieldSchema);
		if (fieldTypedef) {
			fields.push({
				code: fieldCode,
				description: fieldSchema.description,
				title: fieldSchema.title,
				type: fieldTypedef,
			});
		}
	}
	return {
		title: schema.title,
		description: schema.description,
		isSingleton,
		fields,
	};
}

function inlineRefs(currentNode, globalSchema) {
	if (typeof currentNode != 'object' && !Array.isArray(currentNode)) {
		return currentNode;
	}
	if (Array.isArray(currentNode)) {
		let res = [];
		for (let child of currentNode) {
			res.push(inlineRefs(child, globalSchema))
		}
		return res;
	}
	if (typeof currentNode == 'object') {
		if (currentNode.$ref) {
			// Если есть ref, то просто возвращаем то, что там (обрабатывая по пути)
			let inlined = getNodeByDefinition(globalSchema, currentNode.$ref);
			inlined = inlineRefs(inlined, globalSchema);
			return inlined;
		}
		// Если нет ref, то просто обрабатываем все ноды и возвращаем что получилось
		let res = {}
		if (currentNode.allOf) {
			for (let obj of currentNode.allOf) {
				let src = inlineRefs(obj, globalSchema);
				for (let key of Object.keys(src)) {
					res[key] = src[key];
				}
			}
		}
		for (let key of Object.keys(currentNode)) {
			if (key == 'allOf') continue;
			res[key] = inlineRefs(currentNode[key], globalSchema);
		}
		let additional = currentNode.additionalProperties;
		if (additional) {
			res = {... res, ...additional};
		}
		return res;
	}
}


module.exports = class extends getClass('dweller') {

	async cmd_run({ schema }) {
		let newSchema = inlineRefs(schema, schema);
		delete newSchema.definitions;
		let res = {};
		for (let templateCode of newSchema.required) {
			let templateSchema = newSchema.properties[templateCode];
			let parsedTemplate = templateFromSchema(templateSchema);
			if (parsedTemplate) {
				res[templateCode] = parsedTemplate;
			}
		}

		for (let [templateCode, templateData ] of Object.entries(res)) {
			let templateStorage = engine.get('content.templates');
			let templateModels = await templateStorage.getAll({ id: templateCode });
			var templateModel = templateModels[0];
			if (!templateModel) {
				templateModel = templateStorage.createModel({
					id: templateCode,
					values: {
						title: templateData.title,
						singleton: templateData.isSingleton,
					}
				});
				await templateModel.save();
			}
			let templateParamsStorage = templateModel.get('params');
			let templateParams = await templateParamsStorage.getAll();
			let fields = templateData.fields;
			// TODO: Нужно сделать сильно аккуратнее.
			// Не хватает удаления парамсов и миграции значений при конфликтах
			if (fields) {
				for (let fieldData of fields) {
					let param = templateParams.find(param => param.values.code == fieldData.code);
					if (!param) {
						param = templateParamsStorage.createModel({
							values: {
								code: fieldData.code,
							}
						});
					}
					param.values.title = fieldData.title ?? param.values.title;
					param.values.description = fieldData.description ?? param.values.description
					param.values.type = fieldData.type ?? param.values.type;
					await param.save();
					// code, title, type, description
				}
			}
		}
	}
}



