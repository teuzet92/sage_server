module.exports = class extends getClass('core/storage/storage') {

	cmd_createTarget({ targetId }) {
		return this.createTarget(targetId)
	}
	async createTarget(targetId) {
		let target = this.createModel({
			id: targetId,
			values: {
				title: targetId,
			}
		});
		await target.save();
	}

}
