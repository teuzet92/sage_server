module.exports = class extends getClass('dweller') {
	constructor(data) {
		let defaultModelConfig = objget(data.project.config, 'storage', 'model');
		objmerge(data.config, defaultModelConfig, 'target');
		super(data);
	}

	init(data) {
		this.createTime = data.createTime;
		this.updateTime = data.updateTime;
		this.values = data.values ?? {};
		this.temlateId = data.templateId;
	}

	saveData() {
		let out = {
			id: this.id,
			createTime: this.createTime,
			updateTime: this.updateTime,
			templateId: this.temlateId, // Совсем костыль, но править долго
			values: this.values,
		};
		return out;
	}

	save() {
		if (!this.createTime) {
			this.createTime = this.time();
			var creation = true;
		}
		let saveData = this.saveData();
		if (creation) {
			return this.parent.providerCall('insert', saveData);
		} else {
			saveData.updateTime = this.time();
			return this.parent.providerCall('update', { id: this.id }, saveData);
		}
	}

	cmd_delete() {
		this.parent.providerCall('delete', { id: this.id });
	}


	cmd_load() {
		return this.saveData();
	}

	cmd_update({ values }) {
		for (let key in values) {
			this.values[key] = values[key];
		}
		return this.save();	
	}
}
