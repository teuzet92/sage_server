module.exports = class extends getClass('dweller') {

	async construct(value, param, objectSaveData) {
		if (param.values.type.inline) {
			let constructDweller = this.parent.parent;
			let constructedObject = await constructDweller.constructObject(value);
			constructedObject = { ...constructedObject };
			delete constructedObject.id;
			return constructedObject;
		}
		return value;
	}
}
