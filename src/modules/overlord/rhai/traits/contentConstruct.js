const onContentConstructed = async function (constructionCtx) {
	constructionCtx.result.rhaiScripts = constructionCtx.rhaiScripts;
}

const onGetConstructorForDatatype = function(datatype, out) {
	if (datatype.name !== 'script') return;
	if (datatype.language !== 'rhai') return;
	out.constructorId = 'rhai';
}

module.exports = {
	callbacks: {
		onContentConstructed,
		onGetConstructorForDatatype,
	}
}
