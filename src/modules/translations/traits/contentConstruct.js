const onContentConstructed = async function (constructionCtx) {
	let translationsStorage = engine.get('translations');
	let translationModels = await translationsStorage.getAll();
	let translationsBySource = {};
	let languages = Object.values(engine.config.translation.languages);
	for (let translationModel of translationModels) {
		let translations = {};
		for (let lang of languages) {
			if (lang.skip) continue;
			translations[lang.code] = translationModel.values[lang.code];
		}
		translationsBySource[translationModel.values.source] = translations;
	}
	let translationResult = {};
	for (let source of Object.keys(constructionCtx.translatedStrings)) {
		for (let lang of languages) {
			if (lang.skip) continue;
			let translation = objget(translationsBySource, source, lang.code)
			if (translation) {
				objset(translationResult, translation, lang.code, source);
			}
		}
	}
	constructionCtx.result.loc = translationResult;
}

module.exports = {
	callbacks: {
		onContentConstructed,
	}
}
