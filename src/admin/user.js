module.exports = class extends getClass('storage/model/model') {

	async cmd_login({ password }) {
		assert(password == this.values.password, 'Wrong password');
		let session = uuid();
		this.values.session = session;
		await this.save();
		return this;
	}
}
