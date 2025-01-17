const onContentConstructed = async function (constructionCtx) {
	constructionCtx.result.rhaiScripts = constructionCtx.rhaiScripts;
}

const onGetConstructorForParam = function(param, out) {
	let paramType = param.values.type;
	if (paramType.name !== 'script') return;
	if (paramType.language !== 'rhai') return;
	out.constructorId = 'rhai';
}

module.exports = {
	callbacks: {
		onContentConstructed,
		onGetConstructorForParam,
	}
}
