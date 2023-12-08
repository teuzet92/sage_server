module.exports = class extends getClass('api/command') {
	run({ updatedFields }) {
		return this.parent.update(updatedFields);		
	}
}
