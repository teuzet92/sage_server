module.exports = class extends getClass('storage/storage') {

	async cmd_createUser({ id }) {
		let users = await this.getAll({ id });
		assert(users.length == 0, `User with id '${id}' already exists`);
		let user = this.createModel({ id, values: { password: id } });
		await user.save();
		return user.saveData();
	}

	async cmd_validateSession({ session }) {
		let users = await this.getAll({ 'values.session': session });
		assert(users.length == 1, 'Unkown or expired session');
		return users[0].saveData();
	}

}
