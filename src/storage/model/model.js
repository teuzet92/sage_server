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
		this.templateId = data.templateId;
		this.loaded = data.loaded;
	}

	async onLoad() {
		let [ data ] = await this.parent.providerCall('getAll', { id: this.id }, { limit: 1 });
		assert(data, `Model with id '${this.id}' does not exist in storage '${this.parent.fullId}'`);
		data.loaded = true;
		this.init(data);
	}

	saveData() {
		let out = {
			id: this.id,
			createTime: this.createTime,
			updateTime: this.updateTime,
			templateId: this.templateId, // TODO: Перенести в колбэк onSaveData
			values: this.values,
		};
		return out;
	}

	toJSON() { // TODO: Вообще-то это хак. Возвращаем не json а объект.
		let saveData = this.saveData();
		return saveData;
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
