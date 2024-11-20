const onContentConstructed = async function (constructionCtx) {
	constructionCtx.result.scripts = constructionCtx.scripts;
}

const onGetConstructorForParam = function(param, out) {
	let paramType = param.values.type;
	if (paramType.name !== 'script') return;
	if (paramType.language !== 'rhai') return;
	out.constructorId = this.get('rhai');
}

module.exports = {
	callbacks: {
		onContentConstructed,
		onGetConstructorForParam,
	}
}
