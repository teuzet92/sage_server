module.exports = class extends getClass('dweller') {

	construct(value) {
		return this.parent.parent.getObjectId(value);
	}
}
