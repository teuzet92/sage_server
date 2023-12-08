module.exports = class extends getClass('storage/storage') {
	async getSchema() {
		let templateId = this.parent.id;
		let templateParamsStorage = await this.project.get('content.templateParams');
		let myParams = await templateParamsStorage.find({ 'data.templateId': templateId });
		return myParams.map(paramObject => ({
			code: paramObject.data.code,
			title: paramObject.data.title,
			type: paramObject.data.type,
		}));
	}

	insert(model) {
		return super.insert({ templateId: this.parent.id, ...model });
	}

	updateOne(query = {}, updates) {
		return super.updateOne({ templateId: this.parent.id, ...query }, updates);
	}

	find(query = {}) {
		return super.find({ templateId: this.parent.id, ...query });
	}

	findOne(query = {}) {
		return super.findOne({ templateId: this.parent.id, ...query })
	}

	deleteOne(query = {}) {
		return super.deleteOne({ templateId: this.parent.id, ...query })
	}


}
