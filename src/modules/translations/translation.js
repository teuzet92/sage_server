module.exports = class extends getClass('core/storage/model') {
	async onSave(newSaveData, creation) {
		if (creation) return;
		let newValue = newSaveData.values.orig;
		if (newValue != this.lastSaveData.values.orig) {
			let [ sourceDwellerId, fieldCode ] = this.values.source.split(':');
			let sourceDweller = await engine.getAsync(sourceDwellerId);
			sourceDweller.values[fieldCode] = newValue;
			sourceDweller.save();
		}
	}
}
