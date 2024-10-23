module.exports = class extends getClass('core/storage/model') {
	async onSave() {
		this.parent.parent.get('objects').recalcSchema();
	}
}
