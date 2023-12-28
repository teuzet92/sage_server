module.exports = class extends getClass('dweller') {

	async cmd_dump() {
		let result = {}
		let templatesStorage = await this.get('templates');
		let objectsStorage = await this.get('objects');
		let templates = await templatesStorage.getAll();
		let objects = await objectsStorage.getAll();
		return {
			templates: templates.map(tpl => tpl.saveData()),
			objects: objects.map(obj => obj.saveData()),
		}
	}

	async cmd_restore({ content }) {
		let { templates, objects } = content;
		let templatesStorage = await this.get('templates');
		let objectsStorage = await this.get('objects');
		await templatesStorage.providerCall('delete');
		await objectsStorage.providerCall('delete');
		await templatesStorage.providerCall('insertMany', templates);
		await objectsStorage.providerCall('insertMany', objects);
	}
}
