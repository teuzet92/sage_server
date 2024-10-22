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
		let users = await this.getAll({ 'values.session': session });
		// TODO: add session removal
		assert(users.length == 1, 'Unkown or expired session');
		return users[0].saveData();
	}

}
