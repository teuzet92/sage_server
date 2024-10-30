const onSave = async function ({ newSaveData, oldSaveData, creation }) {
	if (creation) return;
	let defaultLanguageCode = assert(engine.config.translation.defaultLanguage);
	let newValue = newSaveData.values[defaultLanguageCode];
	if (newValue != oldSaveData.values[defaultLanguageCode]) {
		let [ sourceDwellerId, fieldCode ] = this.values.source.split(':');
		let sourceDweller = await engine.getAsync(sourceDwellerId);
		sourceDweller.values[fieldCode] = newValue;
		sourceDweller.save();
	}
}

module.exports = class extends getClass('core/storage/model') {
	init(data) {
		super.init(data);
		this.addCallback('onSave', onSave);
	}
}
