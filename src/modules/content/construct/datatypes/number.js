module.exports = class extends getClass('dweller') {

	construct(value, datatype, path, ctx) {
		if (!value && ctx.target.values.defaultEmptyFields) {
			return 0;
		}
		return value;
	}
}
