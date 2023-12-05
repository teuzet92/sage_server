module.exports = class Project extends getClass('dweller') {

	constructor(data) {
		super(data);
		this.cachedDwellers = {};
	}
}
