from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
import datetime


class UserProfile(models.Model):
	user = models.OneToOneField(User, related_name='profile')
	email_verified = models.BooleanField(default=False)
	verify_code = models.CharField(max_length=17)
	GENDER_CHOICES = (
		(True, 'Male'),
		(False, 'Female'),
	)
	gender = models.NullBooleanField(choices=GENDER_CHOICES)

			#TODO
			# # ISO/IEC 5218 1 male, 2 - female
			# GENDER_VALUES = {'Male': 1, 'Female': 2}
			# sex = models.SmallIntegerField()
			#
			# def __str__(self):
			# 	return "%s's profile" % self.user
			#
			#
			#
			# @property
			# def gender(self):
			# 	return self.GENDER_VALUES[self.sex.value]
			#
			# @gender.setter
			# def gender(self, value):
			# 	sex = self.GENDER_VALUES.get(self.sex.value)


def create_user_profile(sender, instance, created, **kwargs):
	if created:
		profile, created = UserProfile.objects.get_or_create(user=instance, email_verified=False)


post_save.connect(create_user_profile, sender=User)


class Messages(models.Model):
	"""
	Contains all public messages
	"""
	sender = models.ForeignKey(User, related_name='sender')
	#DateField.auto_now
	time = models.TimeField(default=datetime.datetime.now)
	content = models.CharField(max_length=255)
	id = models.AutoField(primary_key=True)
	receiver = models.ForeignKey(User, null=True, related_name='receiver')

	@property
	def json(self):
		return {
			'user': User.objects.get_by_natural_key(self.sender).username,
			'content': self.content,
			'time': self.time.strftime("%H:%M:%S"),
			'id': self.id
		}


class UserSettings(models.Model):
	"""
	Contains information about user customizable color settings
	"""
	user = models.OneToOneField(User, related_name='user_id', primary_key=True)
	text_color = models.CharField(max_length=6, null=True)
	self_text_color = models.CharField(max_length=6, null=True)
	others_text_color = models.CharField(max_length=6, null=True)
	private_text_color = models.CharField(max_length=6, null=True)
	background_color = models.CharField(max_length=6, null=True)