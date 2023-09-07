const { 
  v1: uuidv1,
} = require('uuid');

global.assert = (value, message = 'Assertion failed') => { // TODO: format
	if (value) return true;
	throw new Error (message);
}

global.objget = (obj, ...path) => {
	assert(obj)
	return path.reduce((acc, pathElement, idx) => {
		if (!acc) return undefined;
		if (!acc[pathElement]) return undefined;
		return acc[pathElement];
	}, obj);
}

global.objset = (obj, value, ...path) => {
	assert(obj)
	path.reduce((acc, pathElement, idx) => {
		if (idx < path.length - 1) {
			if (!acc[pathElement]) {
				acc[pathElement] = {};
			}
		} else {
			acc[pathElement] = value;
		}
		return acc[pathElement];
	}, obj);
}

global.objinsert = (obj, value, ...path) => {
	assert(obj)
	path.reduce((acc, pathElement, idx) => {
		if (idx < path.length - 1) {
			if (!acc[pathElement]) {
				acc[pathElement] = {};
			}
		} else {
			if (!acc[pathElement]) {
				acc[pathElement] = [];
			}
			acc[pathElement].push(value)
		}
		return acc[pathElement];
	}, obj);
}

global.objmerge = (target, source, noCollisions) => {
	const isObject = (obj) => obj && typeof obj === 'object';

	if (!isObject(target) || !isObject(source)) {
		return source;
	}

	Object.keys(source).forEach(key => {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			target[key] = targetValue.concat(sourceValue); // check collisions?
		} else if (isObject(targetValue) && isObject(sourceValue)) {
			target[key] = objmerge(Object.assign({}, targetValue), sourceValue);
		} else {
			assert(!noCollisions || sourceValue === undefined, `Object merge collision at key '${key}'`);
			target[key] = sourceValue;
		}
	});
	return target;
}

global.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

global.now = () => {
	return Math.floor(Date.now() / 1000);
}

global.uuid = uuidv1;
