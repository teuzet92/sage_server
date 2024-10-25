module.exports = class extends getClass('core/storage/model') {

	async onSave(newSaveData, creation) { // TODO: Перенести в трейт, который накатывала бы translations
		let schema = await this.parent.getSchema();
		for (let field of Object.values(schema.fields)) {
			let fieldType = field.type;
			if (fieldType.name != 'string') continue;
			if (!fieldType.translated) continue;
			let newValue = newSaveData.values[field.code];
			let oldValue = this.lastSaveData.values[field.code];
			// Если объект старый и строка не изменилась - не трогаем перевод
			if (!creation && oldValue == newValue) continue;
			let translations = engine.get('translations');
			translations.setTranslation({
				source: `${this.fullId}:${field.code}`, // TODO: nested поля
				value: newValue,
			});
		}
	}
}
