module.exports = class extends getClass('dweller') {

	async construct(value, datatype, path, ctx) {
		if (!ctx.target.values.defaultEmptyFields) {
			return value;
		}
		let res = [];
		value = value ?? [];
		let contentConstruct = engine.get('content.construct');
		let valueType = datatype.valueType;
		let constructor = contentConstruct.getConstructorForDatatype(valueType);
		for (let i in value) {
			res.push(await constructor.construct(value[i], valueType, path.concat([ i ]), ctx))
		}
		return res;
	}
}
