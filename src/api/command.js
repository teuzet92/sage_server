class Command extends getClass('dweller:Dweller') {
	run() {
		throw new Error('Base command run!');
	}
}

module.exports = { Command };
