module.exports = class extends getClass('dweller') {
	constructor(data) {
		let defaultModelConfig = objget(data.project.config, 'storage', 'model');
		objmerge(data.config, defaultModelConfig, 'target');
		super(data);
		this.values = data.values;
	}

	cmd_delete() {
		console.log(this.parent.config)
		return this.parent.deleteOne({ id: this.id });
	}

	cmd_load() {
		return this.load();
	}
	load() {
		return this.parent.findOne({ id: this.id });
	}

	cmd_update({ updatedFields }) {
		if (!updatedFields) return;
		return this.update(updatedFields);		
	}
	update(updatedFields) {
		return this.parent.updateOne({ id: this.id }, updatedFields);
	}
}
