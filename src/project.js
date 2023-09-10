module.exports = class Project extends getClass('dweller') {
	onCreate() {
		this.cachedDwellers = {};
	}
}
