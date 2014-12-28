from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
import datetime


class UserProfile(models.Model):
	user = models.OneToOneField(User, related_name='profile')
	email_verified = models.BooleanField(default=False)
	verify_code = models.CharField(max_length=17)

	def __str__(self):
		return "%s's profile" % self.user


def create_user_profile(sender, instance, created, **kwargs):
	if created:
		profile, created = UserProfile.objects.get_or_create(user=instance, email_verified=False)


post_save.connect(create_user_profile, sender=User)


class Messages(models.Model):
	userid = models.ForeignKey(User)
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
	user = models.OneToOneField(User, related_name='user_id', primary_key=True)
	text_color = models.CharField(max_length=7, null=True)
	self_text_color = models.CharField(max_length=7, null=True)
	others_text_color = models.CharField(max_length=7, null=True)
	private_text_color = models.CharField(max_length=7, null=True)
	background_color = models.CharField(max_length=7, null=True)