module.exports = class extends getClass('dweller') {

	async construct(value, datatype, path, ctx) {
		// TODO: Отвратительно работает с nested полями
		if (!datatype.translated) {
			return value ?? "";
		}
		let constructDweller = this.parent.parent;
		let sourceId = path.join('.');
		objset(constructDweller.constructionCtx, true, 'translatedStrings', sourceId);
		return sourceId;
	}
}
