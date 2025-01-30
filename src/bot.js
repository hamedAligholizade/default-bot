const TelegramBot = require('node-telegram-bot-api');
const config = require('./config/config');
const { initDatabase } = require('./database/init');
const queries = require('./database/queries');
const { statsHandler } = require('./commands/stats');
const { broadcastHandler } = require('./commands/broadcast');

// Initialize bot
const bot = new TelegramBot(config.botToken, { polling: true });

// Initialize database
initDatabase().catch(console.error);

// Command handlers
bot.onText(/\/start/, async (msg) => {
  const { id: userId, username, first_name, last_name } = msg.from;
  const botName = (await bot.getMe()).username;

  try {
    await queries.saveUser(userId, username, first_name, last_name, botName);
    await bot.sendMessage(msg.chat.id, 'Welcome to the bot! 👋');
  } catch (error) {
    console.error('Error saving user:', error);
  }
});

bot.onText(/\/stats/, (msg) => statsHandler(msg, bot));
bot.onText(/\/broadcast (.+)/, (msg) => broadcastHandler(msg, bot));

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot is running...'); 