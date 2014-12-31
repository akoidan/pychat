from datetime import datetime
from django.contrib.auth.models import User
from drealtime import iShoutClient
from django.contrib.sessions.models import Session

ishout_client = iShoutClient()

def send_message(message):
	ishout_client.get_room_status('notifications')
	ishout_client.broadcast(
		channel='notifications',
		data=get_message(message)
	)

def get_message(message):
	return {
		'user': User.objects.get_by_natural_key(message.userid).username,
		'content': message.content,
		'hour': message.time.hour,
		'minute': message.time.minute,
		'second': message.time.second,
		'id': message.id
	}

def get_users(users):
	result = {}
	for user in users:
		result[user.id] = user.username
	return result



def refresh_user_list(**kwargs):
	sessions = Session.objects.filter(expire_date__gte=datetime.now())
	uid_list = []  # Build a list of user ids from that query
	for session in sessions:
		data = session.get_decoded()
		uid_list.append(data.get('_auth_user_id', None))
	# Query all logged in users based on id list
	logged_users = User.objects.filter(id__in=uid_list)
	ishout_client.broadcast(
		channel='refresh_users',
		data=get_users(logged_users)
	)
