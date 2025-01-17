module.exports = class extends getClass('dweller') {

	async construct(value, param, objectSaveData) {
		let scriptId = `content.${objectSaveData.templateId}.${objectSaveData.id}.${param.values.code}.rhai`;
		let constructDweller = this.parent.parent;
		objset(constructDweller.constructionCtx, value, 'rhaiScripts', scriptId);
		return `{{ script('scripts/${scriptId}'') }}`;
	}
}
