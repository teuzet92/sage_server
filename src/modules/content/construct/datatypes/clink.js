module.exports = class extends getClass('dweller') {

	async construct(value, datatype, path, ctx) {
		if (!value && ctx.target.values.defaultEmptyFields) {
			assert(`Empty link ${path.join('.')}`);
		}
		return value;
	}
}
