module.exports = class extends getClass('dweller') {

	async construct(value, datatype, path, ctx) {
		if (!ctx.target.values.defaultEmptyFields) {
			return value;
		}
		let res = {};
		value = value ?? {};
		let contentConstruct = engine.get('content.construct');
		for (let field of datatype.fields) {
			let fieldType = field.type;
			let constructor = contentConstruct.getConstructorForDatatype(fieldType);
			res[field.code] = await constructor.construct(value[field.code], fieldType, path.concat(field.code), ctx)
		}
		return res;
	}
}
