function prepareQuery(query) {
	if (!query) return;
	let prepared = { ... query };
	if (prepared.id) {
		prepared._id = prepared.id;
		delete(prepared.id);
	}
	return prepared;
}

function prepareResult(obj) {
	if (!obj) return;
	let prepared = { ...obj };
	if (prepared._id) {
		prepared.id = prepared._id;
		delete prepared._id;
	}
	return prepared;
}

function createBulkPromise() {
	let resolve, reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

module.exports = { prepareQuery, prepareResult, createBulkPromise }
