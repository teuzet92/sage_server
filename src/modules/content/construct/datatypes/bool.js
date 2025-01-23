module.exports = class extends getClass('dweller') {

	construct(value, datatype, path, ctx) {
		env.log('BOOL!')
		env.log(ctx.target.values)
		if (ctx.target.values.defaultEmptyFields) {
			env.log('EMPTY FIELDS')

			return value ? true : false;
		}
		return value;
	}
}
