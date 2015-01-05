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

	def __str__(self):
		return "%s's profile" % self.user


def create_user_profile(sender, instance, created, **kwargs):
	if created:
		profile, created = UserProfile.objects.get_or_create(user=instance, email_verified=False)


post_save.connect(create_user_profile, sender=User)


class Messages(models.Model):
	"""
	Contains all public messages
	"""
	userid = models.ForeignKey(User)
	#DateField.auto_now¶
	time = models.TimeField(default=datetime.datetime.now)
	content = models.CharField(max_length=255)
	id = models.AutoField(primary_key=True)

	@property
	def json(self):
		return {
		'user': User.objects.get_by_natural_key(self.userid).username,
		'content': self.content,
		'time': self.time.strftime("%H:%M:%S"),
		'id': self.id
		}



class PrivateMessages(models.Model):
	"""
	Contains all private messages. Don't want to inherit it
	from Messages class to simplify DataBase view
	"""
	addressee = models.ForeignKey(User, related_name='receiver')
	userid = models.ForeignKey(User, related_name='sender')
	#DateField.auto_now¶
	time = models.TimeField(default=datetime.datetime.now)
	content = models.CharField(max_length=255)
	id = models.AutoField(primary_key=True)

	# def __repr__(self):
	# 	return repr(
	# 		dict(
	# 			user=User.objects.get_by_natural_key(self.userid).username,
	# 			content=self.content,
	# 			hour=self.time.hour,
	# 			minute=self.time.minute,
	# 			second=self.time.second,
	# 			id=self.id,
	# 		)
	# 	)


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