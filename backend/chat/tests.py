import json
import ssl
from random import randint
from random import random
from threading import Thread
from time import sleep

from django.conf import settings
from django.test import TestCase
from websocket import create_connection

# class ModelTest(TestCase):
#
# 	def test_gender(self):
# 		user = UserProfile(sex_str='Female')
# 		self.assertEqual(user.sex, 2)
# 		user.sex_str = 'Male'
# 		self.assertEqual(user.sex, 1)
# 		user.sex_str = 'WrongString'
# 		self.assertEqual(user.sex, 0)
#
#
# class RegisterUtilsTest(TestCase):
#
# 	def test_check_password(self):
# 		self.assertRaises(ValidationError, check_password, "ag")
# 		self.assertRaises(ValidationError, check_password, "")
# 		self.assertRaises(ValidationError, check_password, "  	")
# 		self.assertRaises(ValidationError, check_password, "  fs	")
# 		check_password("FineP@ssord")
#
# 	def test_send_email(self):
# 		up = UserProfile(username='Test', email='nightmare.quake@mail.ru', sex_str='Mail')
# 		send_email_verification(up, 'Any')
#
# 	def test_check_user(self):
# 		self.assertRaises(ValidationError, check_user, "d"*100)
# 		self.assertRaises(ValidationError, check_user, "asdfs,+")
# 		check_user("Fine")
#
#
# class SeleniumBrowserTest(TestCase):
#
# 	def test_check_main_page(self):
# 		driver = webdriver.Firefox()
# 		driver.get("localhost:8000")  # TODO inject url
# 		assert "chat" in driver.title
# 		elem = driver.find_element_by_id("userNameLabel")
# 		self.assertRegexpMatches(elem.text, "^[a-zA-Z-_0-9]{1,16}$")
# 		driver.close()
from chat.global_redis import sync_redis
from chat.models import UserProfile
from chat.socials import GoogleAuth
from chat.tornado.constants import VarNames, Actions


class RegisterTest(TestCase):

    def test_animals_can_speak(self):
		user_profile = UserProfile(
			 name='test',
			 surname='test',
			 email='asd@mail.ru',
			 username='test'
		 )
		gauth = GoogleAuth()
		gauth.download_http_photo('https://lh4.googleusercontent.com/-CuLSUOTQ4Kw/AAAAAAAAAAI/AAAAAAAAANQ/VlgHrqehE90/s96-c/photo.jpg', user_profile)

class WebSocketLoadTest(TestCase):

	SITE_TO_SPAM = "127.0.0.1:8888"

	def setUp(self):
		pass
		# Room.objects.create(name=ANONYMOUS_REDIS_ROOM)
		# subprocess.Popen("/usr/bin/redis-server")
		# thread = Thread(target=call_command, args=('start_tornado',))
		# thread.start()

	def threaded_function(self, session, num):
		cookies = '{}={}'.format(settings.SESSION_COOKIE_NAME, session)

		ws = create_connection("wss://{}".format(self.SITE_TO_SPAM), cookie=cookies, sslopt={"cert_reqs": ssl.CERT_NONE})
		print("Connected #{}  with sessions {}".format(num, session))
		for i in range(randint(30, 50)):
			if i % 10 == 0:
				print("{}#{} sent {}".format(session, num, i))
			sleep(random())
			ws.send(json.dumps({
				VarNames.CONTENT: "{}".format(i),
				VarNames.EVENT: Actions.PRINT_MESSAGE,
				VarNames.ROOM_ID: settings.ALL_ROOM_ID
			}))

	# def read_session(self):
	# 	with open('sessionsids.txt') as f:
	# 		lines =f.read().splitlines()
	# 		return lines


	def read_session(self):
		return [k for k in sync_redis.keys() if len(k) == 32]

	def test_simple(self):
		max_users = 10
		for session in self.read_session():
			max_users -= 1
			if max_users < 0:
				break
			for i in range(randint(3, 7)):
				thread = Thread(target=self.threaded_function, args=(session, i))
				thread.start()
