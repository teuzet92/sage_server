const slashCommand = require('slash-command');
const util = require('util');

const commands = {};

module.exports = class extends getClass('dweller') {
	async cmd_start({ telegramId }) {
		let playerStorage = await this.project.get('shards.players');
		let playerModel = playerStorage.findOne({ 'values.telegramId': telegramId }); // TODO: в один upsert
		if (!playerModel) {

		} else {

		}
	}

	async onMessage(userData, message) {
		let { userId, username } = userData;
		console.log('CHILD')
		console.log(`shards.players.${userId}`)
		let playerStorage = await this.project.get('shards.players');
		var playerData = await playerStorage.findOne({ 'values.telegramId': userId });
		if (!playerData) {
			await playerStorage.createModel({
				values: {
					telegramId: userId,
					telegramUsername: username,
				}
			});
			playerData = await playerStorage.findOne({ 'values.telegramId': userId });
		}
		assert(playerData, 'Player not found');
		let playerId = playerData.id;

		let player = await playerStorage.get(playerId);

		let { command, body } = slashCommand(message.text);
		let action = command;
		console.log(command, body)

		let actionParams = player.config.apiActions[action].params;
		if (actionParams) {
			let firstParamKey = Object.keys(actionParams)[0];
			var rawParams = {};
			rawParams[firstParamKey] = body;
		}
		return player.runAction(action, rawParams);
	}

}

// async function loadUserGame(userId) {
// 	let userState = await mongo.findOne('users', { id: userId });
// 	assert(userState, getString('telegram_no_game'));
// 	let gameId = userState.gameId;
// 	assert(gameId, getString('telegram_no_game'));
// 	let savedGame = await mongo.findOne('games', { id: gameId });
// 	assert(savedGame, getString('telegram_no_game'));

// 	let chat = await mongo.find('gameChatMessages', { gameId });
// 	savedGame.chat = chat.map(messageData => messageData.message);
// 	savedGame.mongo = true;

// 	let game = new Game(savedGame);
// 	return game;
// }

// commands.start = function(userId, cityName) {
// 	bot.sendMessage(userId, 'Welcome');
// }

// commands.new = async function(userId, cityName) {
// 	// TODO: ask to start new game
// 	let game = new Game({
// 		id: uuid(),
// 		userId: userId,
// 		cityName,
// 		mongo: true,
// 	});
// 	game.init();
// 	mongo.updateOne('users', { id: userId }, { $set: { gameId: game.id } }, { upsert: true });
// 	bot.sendMessage(userId, game.cityDescription);
// 	// bot.sendMessage(userId, formatString('telegram_test_new_game', cityName));
// }

// commands.next = async function(userId) {
// 	try {
// 		var game = await loadUserGame(userId);
// 	} catch (e) {
// 		bot.sendMessage(userId, e.message);
// 		return;
// 	}
// 	let newChronicle = await game.next();

// 	if (true) {
// 		let soundFilename = game.getSoundTitle();
// 		await sound(newChronicle.content, soundFilename)
// 		bot.sendAudio(userId, soundFilename, { caption: newChronicle.content });
// 	}
// 	// bot.sendMessage(userId, newChronicle.content);
// }

// commands.event = async function(userId, event) {
// 	try {
// 		var game = await loadUserGame(userId);
// 	} catch (e) {
// 		bot.sendMessage(userId, e.message);
// 		return;
// 	}
// 	if (!event) {
// 		bot.sendMessage(userId, getString('telegram_error_no_event'));
// 		return;
// 	}
// 	game.pushEvent(event);
// }

// commands.help = function() {

// }


// bot.on('message', (msg) => {
// 	const userId = msg.chat.id;
// 	let commandData = slashCommand(msg.text);
// 	let commandName = commandData.command;
// 	let commandHandler = commands[commandName];
// 	if (!commandHandler) {
// 		let str = formatString('telegram_unknown_command', commandName);
// 		bot.sendMessage(userId, str);
// 		return;
// 	}
// 	commandHandler(userId, commandData.body);

//   // const messageText = msg.text;

//   // if (messageText === '/start') {
//   //   bot.sendMessage(userId, 'Welcome to the bot!');
//   // }
// });

// bot.setMyCommands([
// 	// { command: "start", description: "Welcome"},
// 	{ command: "new", description: "Starts new game" },
// 	{ command: "next", description: "Generates next chronicle record" },
// 	{ command: "event", description: "Add and event to the chronicle" },
// ]);
