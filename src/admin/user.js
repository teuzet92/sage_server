module.exports = class extends getClass('storage/model/model') {

	async cmd_login({ password }) {
		let session = uuid();
		this.values.session = session;
		await this.save();
		return session;
	}

}
