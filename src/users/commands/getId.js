module.exports = class extends getClass('api/command') {
	run() {
		return this.parent.fullId;		
	}
}
