const onModelDeleted = function() {
	this.parent.get('objects').recalcSchema();
}

module.exports = class extends getClass('core/storage/storage') {
	init(data) {
		super.init(data);
		this.addCallback('onModelDeleted', onModelDeleted);
	}
}
