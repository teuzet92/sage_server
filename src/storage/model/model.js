module.exports = class extends getClass('dweller') {
	constructor(data) {
		let defaultModelConfig = objget(data.project.config, 'storage', 'model');
		objmerge(data.config, defaultModelConfig, 'target');
		super(data);
		this.values = data.values;
	}

	getMe () {
		let storage = this.parent;
		return storage.findOne({ id: this.id });
	}

	update(updatedValues) {
		return this.parent.updateOne({ id: this.id }, updatedValues);
	}
}
