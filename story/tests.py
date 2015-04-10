from django.test import TestCase

from story.models import UserProfile


class ModelTest(TestCase):

	def test_gender(self):
		user = UserProfile(sex_str='Female')
		self.assertEqual(user.sex, 2)
		user.sex_str = 'Male'
		self.assertEqual(user.sex, 1)
		user.sex_str = 'WrongString'
		self.assertEqual(user.sex, 0)