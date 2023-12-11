module.exports = class extends getClass('storage/storage') {

	async getSchema() {
		let templateModel = this.parent;
		let templateId = templateModel.id;
		let templateParamsStorage = await this.project.get('content.templateParams');
		let myParams = await templateParamsStorage.find({ 'data.templateId': templateId });
		let fields = {};
		for (let paramObject of myParams) {
			let { code, title, type } = paramObject.data;
			fields[code] = {
				code,
				title,
				type,
			};
		}
		return {
			fields,
		}
	}

	createModel(model) {
		return super.createModel({ templateId: this.parent.id, ...model });
	}

	updateOne(query = {}, updates) {
		console.log('UPDATE ONE CONTENT')
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
