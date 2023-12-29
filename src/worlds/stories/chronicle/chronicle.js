module.exports = class extends getClass('storage/storage') {

	createModel(model) {
		model.values.gameId = this.parent.id;
		return super.createModel(model);
	}

	providerCall(method, query = {}, ...params) {
		query['values.gameId'] = this.parent.id;
		return super.providerCall(method, query, ...params);
	}

}
