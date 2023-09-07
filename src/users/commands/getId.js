class Command extends getClass('api/command:Command') {
	run() {
		return this.parent.fullId;		
	}
}

module.exports = { Command }