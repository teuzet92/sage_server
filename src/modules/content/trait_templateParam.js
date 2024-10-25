onSave = function () {
	this.parent.parent.get('objects').recalcSchema();
}

module.exports = { onSave }

