const { MD5 } = require('crypto-js');

module.exports = class extends getClass('core/storage/storage') {

	async cmd_createUser({ id, password }) {
		let users = await this.getAll({ id });
		assert(users.length == 0, `User with id '${id}' already exists`);
		let user = this.createModel({
			id,
			values: {
				password: MD5(password).toString(),
			},
		});
		await user.save();
		return user.saveData();
	}

	async cmd_validateSession({ session }) {
		let user = await this.getUserBySession(session)
		return user.saveData();
	}

	async getUserBySession(sessionId) {
		let session = await engine.getAsync(`sessions.${sessionId}`);
		assert(session, `No session with id '${sessionId}'`);
		let userId = session.values.userId;
		let user = await engine.getAsync(`users.${userId}`);
		assert(user, `No user with id '${userId}'`);
		return user;
	}
}
