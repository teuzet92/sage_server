module.exports = class extends getClass('dweller') {

	async construct(value, param, objectSaveData) {
		if (!param.values.type.translated) {
			return value;
		}
		let constructDweller = this.parent.parent;
		let sourceId = `content.templates.${objectSaveData.templateId}.objects.${objectSaveData.id}:${param.values.code}`;
		objset(constructDweller.constructionCtx, true, 'translatedStrings', sourceId);
		return sourceId;
	}
}
