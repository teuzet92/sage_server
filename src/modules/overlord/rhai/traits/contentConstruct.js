const onContentConstructed = async function (constructionCtx) {
	constructionCtx.result.rhaiScripts = constructionCtx.rhaiScripts;
}

module.exports = {
	callbacks: {
		onContentConstructed,
	}
}
