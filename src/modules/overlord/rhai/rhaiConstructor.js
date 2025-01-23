module.exports = class extends getClass('dweller') {

	async construct(value, datatype, path, ctx) {
		let scriptId = path.join('.') + '.rhai';
		let storedValue = value;
		if (value !== undefined) {
			storedValue = value.replace(/(\r\n|\n|\r)/gm, "");
		} else {
			storedValue = "";
		}
		objset(ctx, storedValue, 'rhaiScripts', scriptId);
		return `{{ script('scripts/${scriptId}') }}`;
	}
}
