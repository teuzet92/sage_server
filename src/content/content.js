module.exports = class extends getClass('dweller') {

	async cmd_dump() {
		let result = {}
		let templates = await this.get('templates').getAll();
		let objects = await this.get('objects').getAll();
		let templateParams = await this.get('templateParams').getAll();
		return {
			templates,
			objects,
			templateParams,
		}
	}

	async cmd_restore({ content }) {
		let { templates, objects, templateParams } = content;
		let templatesStorage = this.get('templates');
		let templateParamsStorage = this.get('templateParams');
		let objectsStorage = this.get('objects');
		await templatesStorage.providerCall('delete');
		await templateParamsStorage.providerCall('delete');
		await objectsStorage.providerCall('delete');
		await templatesStorage.providerCall('insertMany', templates);
		await templateParamsStorage.providerCall('insertMany', templateParams);
		await objectsStorage.providerCall('insertMany', objects);
	}
}
