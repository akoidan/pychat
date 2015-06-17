from django.core.exceptions import ValidationError
from django.test import TestCase

from story.models import UserProfile
from story.registration_utils import check_password, send_email_verification, check_user

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

class ModelTest(TestCase):

	def test_gender(self):
		user = UserProfile(sex_str='Female')
		self.assertEqual(user.sex, 2)
		user.sex_str = 'Male'
		self.assertEqual(user.sex, 1)
		user.sex_str = 'WrongString'
		self.assertEqual(user.sex, 0)


class RegisterUtilsTest(TestCase):

	def test_check_password(self):
		self.assertRaises(ValidationError, check_password, "ag")
		self.assertRaises(ValidationError, check_password, "")
		self.assertRaises(ValidationError, check_password, "  	")
		self.assertRaises(ValidationError, check_password, "  fs	")
		check_password("FineP@ssord")

	def test_send_email(self):
		up = UserProfile(username='Test', email='nightmare.quake@mail.ru', sex_str='Mail')
		send_email_verification(up, 'Any')

	def test_check_user(self):
		self.assertRaises(ValidationError, check_user, "d"*100)
		self.assertRaises(ValidationError, check_user, "asdfs,+")
		check_user("Fine")


class SeleniumBrowserTest(TestCase):

	def test_check_main_page(self):
		driver = webdriver.Firefox()
		driver.get("localhost:8000")  # TODO inject url
		assert "Chat" in driver.title
		elem = driver.find_element_by_id("userNameLabel")
		self.assertRegexpMatches(elem.text, "^[a-zA-Z-_0-9]{1,16}$")
		driver.close()
