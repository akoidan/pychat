__author__ = 'andrew'
import json

from django.conf import settings
from django.core.management import BaseCommand

from chat import global_redis
from chat import settings
from chat.models import UserProfile, RoomUsers
from chat.settings_base import ALL_ROOM_ID
from chat.tornado.constants import Actions, RedisPrefix, VarNames, HandlerNames


class Command(BaseCommand):
	help = 'Creates initial data in database'

	def handle(self, *args, **options):
		for a in range(100):

			user_profile = UserProfile(username='123'+str(a), email=None, sex_str=None)
			user_profile.set_password('123')
			user_profile.save()
			RoomUsers(user_id=user_profile.id, room_id=settings.ALL_ROOM_ID, notifications=False).save()

			user_data = {
				VarNames.ROOMS: [{
					VarNames.ROOM_ID: settings.ALL_ROOM_ID,
					VarNames.ROOM_USERS: list(RoomUsers.objects.filter(room_id=ALL_ROOM_ID).values_list('user_id', flat=True))
				}],
				VarNames.EVENT: Actions.CREATE_NEW_USER,
				VarNames.HANDLER_NAME: HandlerNames.ROOM,
			}
			user_data.update(RedisPrefix.set_js_user_structure(
				user_profile.id,
				user_profile.username,
				user_profile.sex,
				None
			))
			global_redis.async_redis_publisher.publish(
				settings.ALL_ROOM_ID,
				json.dumps(user_data),
			)

