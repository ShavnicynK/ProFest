from django.core.management.base import BaseCommand
from django.conf import settings
from telebot import TeleBot, types
from ...models import Visitor, BotSettings

bot = TeleBot(settings.TELEBOT_TOKEN, threaded=False)


def get_visitor_by_telegram_user_id(telegram_user_id):
    try:
        return Visitor.objects.get(telegram_user_id=telegram_user_id)
    except Visitor.DoesNotExist:
        return None


class Command(BaseCommand):
    help = 'Just a command for launching a Telegram bot.'

    def handle(self, *args, **kwargs):
        bot.enable_save_next_step_handlers(delay=2)
        bot.load_next_step_handlers()
        bot.infinity_polling()


@bot.message_handler(commands=['start'])
def handle_start(message):
    bot_settings = BotSettings.objects.first()
    keyboard = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    subscribe_button = types.KeyboardButton("Подписаться")
    keyboard.add(subscribe_button)
    bot.send_message(message.chat.id, bot_settings.start_text, reply_markup=keyboard)


@bot.message_handler(func=lambda message: message.text == "Подписаться")
def handle_subscribe(message):
    bot_settings = BotSettings.objects.first()
    telegram_user_id = message.from_user.id
    username = '@' + message.from_user.username
    visitor_by_id = Visitor.objects.filter(telegram_user_id=telegram_user_id).first()

    if visitor_by_id:
        visitor_by_id.telegram_user_id = telegram_user_id
        visitor_by_id.save()
        markup = types.ReplyKeyboardRemove()
        bot.send_message(message.chat.id, bot_settings.stiker_text, reply_markup=markup)
    else:
        visitor_by_username = Visitor.objects.filter(telegram=username).first()
        if visitor_by_username:
            visitor_by_username.telegram_user_id = telegram_user_id
            visitor_by_username.save()
            markup = types.ReplyKeyboardRemove()
            bot.send_message(message.chat.id, bot_settings.stiker_text, reply_markup=markup)
        else:
            new_visitor = Visitor.objects.create(telegram_user_id=telegram_user_id)
            markup = types.ReplyKeyboardRemove()
            bot.send_message(message.chat.id, bot_settings.stiker_text, reply_markup=markup)
