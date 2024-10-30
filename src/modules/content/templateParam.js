const onSave = function () {
	this.parent.parent.get('objects').recalcSchema();
}

module.exports = class extends getClass('core/storage/model') {
	init(data) {
		super.init(data);
		this.addCallback('onSave', onSave);
	}
}
