module.exports = class extends getClass('dweller') {
	constructor(data) {
		let defaultModelConfig = objget(engine.config, 'storage', 'model');
		objmerge(data.config, defaultModelConfig, 'target');
		super(data);
	}

	init(data) {
		this.createTime = data.createTime;
		this.updateTime = data.updateTime;
		this.values = data.values ?? {};
		this.templateId = data.templateId;
		this.lastSaveData = this.saveData();
	}

	saveData() {
		let out = {
			id: this.id,
			createTime: this.createTime,
			updateTime: this.updateTime,
			templateId: this.templateId, // TODO: Перенести в колбэк onSaveData
			values: { ...this.values },
		};
		return out;
	}

	save() {
		if (!this.createTime) {
			this.createTime = this.time();
			var creation = true;
		}
		let newSaveData = this.saveData();
		if (creation) {
			var res = this.parent.providerCall('insert', newSaveData);
		} else {
			newSaveData.updateTime = this.time();
			var res = this.parent.providerCall('update', { id: this.id }, newSaveData);
		}
		let oldSaveData = this.lastSaveData;
		res.then(async () => {
			this.execTraitCallbacks('onSave', { newSaveData, oldSaveData, creation });
			this.lastSaveData = newSaveData;
		});
		return res;
	}

	cmd_delete() {
		let res = this.parent.providerCall('delete', { id: this.id });
		res.then(() => this.parent.execTraitCallbacks('onModelDeleted'));
		return res;
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
