module.exports = class extends getClass('api/command') {
	run(params) {
		let model = this.parent;
		return model.getMe();
	}
}
