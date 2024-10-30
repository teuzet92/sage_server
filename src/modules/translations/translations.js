module.exports = class extends getClass('core/storage/storage') {

	async setTranslation({ source, value }) {
		let translationModels = await this.getAll({ 'values.source': source }, { limit: 1 });
		let translationModel = translationModels[0];
		let defaultLanguageCode = assert(engine.config.translation.defaultLanguage);
		if (!translationModel) {
			// Создаем новую модель, сразу с нужным полем orig, чтобы не триггерить обновление
			let modelData = {
				values: {
					source,
				},
			};
			modelData.values[defaultLanguageCode] = value;
			translationModel = this.createModel(modelData);
			translationModel.save();
			return;
		}
		translationModel.values[defaultLanguageCode] = value;
		translationModel.save();
	}

	async getSchema() {
		if (!this.schema) {
			let schema = {};
			objmerge(schema, this.config.schema);
			let languages = engine.config.translation.languages;
			for (let lang of Object.values(languages)) {
				schema.fields[lang.code] = {
					title: lang.title,
					code: lang.code,
					type: {
						name: 'string',
					},
				};
			}
			this.schema = schema
		}
		return this.schema;
	}

	cmd_extract() {
		// TODO
	}
}
