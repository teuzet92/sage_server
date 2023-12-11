module.exports = class extends getClass('dweller') {
	constructor(data) {
		let defaultModelConfig = objget(data.project.config, 'storage', 'model');
		objmerge(data.config, defaultModelConfig, 'target');
		super(data);
		this.values = data.values;
	}

	cmd_delete() {
		return this.parent.deleteOne({ id: this.id });
	}

	cmd_load() {
		return this.load();
	}
	load() {
		return this.parent.findOne({ id: this.id });
	}

	save() { // TODO: Сделать основным способом сохранять
		return this.update(this.values)
	}

	cmd_update({ values }) {
		if (!values) return;
		return this.update(values);		
	}
	update(values) {
		return this.parent.updateOne({ id: this.id }, values);
	}
}
