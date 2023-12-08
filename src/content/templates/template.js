module.exports = class extends getClass('storage/storage') {
	insert() {
		throw new Error('Cannot create templates directly. Use `createTemplate` command instead');
	}
}
