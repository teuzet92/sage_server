const onSave = async function ({ newSaveData, oldSaveData, creation }) {
	if (creation) return;
	let newValue = newSaveData.values.orig;
	if (newValue != oldSaveData.values.orig) {
		let [ sourceDwellerId, fieldCode ] = this.values.source.split(':');
		let sourceDweller = await engine.getAsync(sourceDwellerId);
		sourceDweller.values[fieldCode] = newValue;
		sourceDweller.save();
	}
}

module.exports = { onSave }
