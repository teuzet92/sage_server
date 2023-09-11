module.exports = class extends getClass('api/command') {
	run(params) {
		return `model.get run: ${params}`;	
	}
}
