module.exports = class extends getClass('core/storage/storage') {
	async onModelDeleted() {
		this.parent.get('objects').recalcSchema();
	}
}
