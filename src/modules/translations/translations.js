module.exports = class extends getClass('core/storage/storage') {

	async setTranslation({ source, value }) {
		let translationModels = await this.getAll({ 'values.source': source }, { limit: 1 });
		let translationModel = translationModels[0];
		if (!translationModel) {
			// Создаем новую модель, сразу с нужным полем orig, чтобы не триггерить обновление
			translationModel = this.createModel({
				values: {
					source,
					orig: value,
				}
			});
			translationModel.save();
			return;
		}
		translationModel.values.orig = value;
		translationModel.save();
	}

	cmd_extract() {
		// TODO
	}
}
