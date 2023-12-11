const TelegramBot = require('node-telegram-bot-api');
const slashCommand = require('slash-command');

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// bot.api.setMyCommands([
// 	{ command: "start", description: "Start"},
// 	{ command: "help", description: "Help" },
// 	{ command: "list", description: "List" },
// ]);

loadStrings('en');

const commands = {};

async function loadUserGame(userId) {
	let userState = await mongo.findOne('users', { id: userId });
	assert(userState, getString('telegram_no_game'));
	let gameId = userState.gameId;
	assert(gameId, getString('telegram_no_game'));
	let savedGame = await mongo.findOne('games', { id: gameId });
	assert(savedGame, getString('telegram_no_game'));

	let chat = await mongo.find('gameChatMessages', { gameId });
	savedGame.chat = chat.map(messageData => messageData.message);
	savedGame.mongo = true;

	let game = new Game(savedGame);
	return game;
}

commands.start = function(userId, cityName) {
	bot.sendMessage(userId, getString('telegram_welcome'));
}

commands.new = async function(userId, cityName) {
	// TODO: ask to start new game
	let game = new Game({
		id: uuid(),
		userId: userId,
		cityName,
		mongo: true,
	});
	game.init();
	mongo.updateOne('users', { id: userId }, { $set: { gameId: game.id } }, { upsert: true });
	bot.sendMessage(userId, game.cityDescription);
	// bot.sendMessage(userId, formatString('telegram_test_new_game', cityName));
}

commands.next = async function(userId) {
	try {
		var game = await loadUserGame(userId);
	} catch (e) {
		bot.sendMessage(userId, e.message);
		return;
	}
	let newChronicle = await game.next();

	if (true) {
		let soundFilename = game.getSoundTitle();
		await sound(newChronicle.content, soundFilename)
		bot.sendAudio(userId, soundFilename, { caption: newChronicle.content });
	}
	// bot.sendMessage(userId, newChronicle.content);
}

commands.event = async function(userId, event) {
	try {
		var game = await loadUserGame(userId);
	} catch (e) {
		bot.sendMessage(userId, e.message);
		return;
	}
	if (!event) {
		bot.sendMessage(userId, getString('telegram_error_no_event'));
		return;
	}
	game.pushEvent(event);
}

commands.help = function() {

}


bot.on('message', (msg) => {
	const userId = msg.chat.id;
	let commandData = slashCommand(msg.text);
	let commandName = commandData.command;
	let commandHandler = commands[commandName];
	if (!commandHandler) {
		let str = formatString('telegram_unknown_command', commandName);
		bot.sendMessage(userId, str);
		return;
	}
	commandHandler(userId, commandData.body);

  // const messageText = msg.text;

  // if (messageText === '/start') {
  //   bot.sendMessage(userId, 'Welcome to the bot!');
  // }
});

bot.setMyCommands([
	// { command: "start", description: "Welcome"},
	{ command: "new", description: "Starts new game" },
	{ command: "next", description: "Generates next chronicle record" },
	{ command: "event", description: "Add and event to the chronicle" },
]);

// bot.command('start', ctx => {
// 	console.log(ctx)
// })

// bot.command('cmd', ctx => {
// 	console.log(ctx)
// })