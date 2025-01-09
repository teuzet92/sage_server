const { MD5 } = require('crypto-js');

module.exports = class extends getClass('dweller') {

	async cmd_run() {
		let providers = this.config.providers;
		if (!providers) return true;
		let resources = {};
		for (let providerId of Object.keys(providers)) {
			let provider = this.get(providerId);
			let providerRes = await provider.provideResources();
			resources = { ...resources, ...providerRes };
		}
		let allResStorage = this.parent.get('resources');
		await allResStorage.providerCall('delete');
		let insertManyPayload = [];
		for (let [ resourceId, values ] of Object.entries(resources)) {
			values.resourceId = resourceId;
			insertManyPayload.push({
				id: MD5(resourceId).toString(),
				values,
			});
		}
		await allResStorage.providerCall('insertMany', insertManyPayload);
	}
}



