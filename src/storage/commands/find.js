module.exports = class extends getClass('api/command') {
	run(params) {
		return this.parent.find(params.query);		
	}
}
