const { MD5 } = require('crypto-js');

module.exports = class extends getClass('core/storage/model') {

	async cmd_login({ password }) {
		assert(password == this.values.password, 'Wrong password');
		let sessionId = uuid();
		let sessionsStorage = engine.get('sessions');
		let session = sessionsStorage.createModel({
			id: sessionId,
			values: {
				userId: this.id,
			},
		});
		await session.save();
		return {
			user: this.saveData(),
			session: {
				id: sessionId,
				// TODO: expires:
			}
		}
	}

	// TODO: change password cmd
}
