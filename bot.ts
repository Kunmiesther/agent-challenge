import { startTelegramBot } from './src/telegram'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not set')
  process.exit(1)
}

console.log('Starting Vectra Telegram bot...')
startTelegramBot(token)
