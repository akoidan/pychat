from datetime import datetime
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.forms import model_to_dict
from drealtime import iShoutClient
from django.contrib.sessions.models import Session
from story.apps import DefaultSettingsConfig
from story.models import UserSettings

ishout_client = iShoutClient()

def renew_room_status(room):
	a = ishout_client.get_room_status()

def send_message(message):
	ishout_client.broadcast(
		channel='notifications',
		data=get_message(message)
	)

def send_user_list():
	room_status = ishout_client.get_room_status('main')
	ishout_client.broadcast(
		channel='refresh_users',
		data=room_status
	)


def get_message(message):
	return {
		'user': User.objects.get_by_natural_key(message.userid).username,
		'content': message.content,
		'time': message.time.strftime("%H:%M:%S"),
		'id': message.id
	}

def get_users(users):
	result = {}
	for user in users:
		result[user.id] = user.username
	return result


def get_user_settings(user):
	if user.is_authenticated():
		try:
			return model_to_dict(UserSettings.objects.get(pk=user.id))
		except ObjectDoesNotExist:
			pass
	return DefaultSettingsConfig.colors