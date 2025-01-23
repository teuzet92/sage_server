module.exports = class extends getClass('dweller') {

	construct(value, datatype, path, ctx) {
		let resourceId = ctx.resources[value];
		if (!resourceId && ctx.target.values.defaultEmptyFields) {
			return "";
		}
		return resourceId;
	}
}
