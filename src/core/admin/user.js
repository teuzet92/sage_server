
module.exports = class extends getClass('core/storage/model') {

	async cmd_login({ password }) {
		assert(password == this.values.password, 'Wrong password');
		let session = uuid();
		this.values.session = session;
		await this.save();
		return this;
	}

	// TODO: change password cmd
}
