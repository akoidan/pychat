from django.core.exceptions import ValidationError
from django.test import TestCase

from story.models import UserProfile
from story.registration_utils import check_password


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
