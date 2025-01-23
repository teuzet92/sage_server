module.exports = class extends getClass('dweller') {

	construct(value, datatype, path, ctx) {
		if (value === undefined && ctx.target.values.defaultEmptyFields) {
			assert('Empty field for basic constructor');
		}
		return value;
	}
}
