module.exports = class extends getClass('storage/storage') {
	async getSchema() {
		let templateId = this.parent.id;
		let templateParamsStorage = await this.project.get('content.templateParams');
		let myParams = templateParamsStorage.find({ templateId });
		return myParams;
	}
}
