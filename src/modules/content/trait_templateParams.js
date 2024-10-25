onModelDeleted = function() {
	this.parent.get('objects').recalcSchema();
}

module.exports = { onModelDeleted }
