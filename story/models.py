import uuid
import datetime

from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.db.models import ImageField, CharField, DateField, TextField


class UserProfile(AbstractBaseUser):
	def get_short_name(self):
		return self.name

	def get_file_path(self, filename):
		"""
		:param filename base string for generated name
		:return: a unique string filename
		"""
		ext = filename.split('.')[-1]
		return "%s.%s" % (uuid.uuid4(), ext)

	def get_full_name(self):
		return '%s %s' % (self.name, self.surname)

	@property
	def is_staff(self):
		# every registered user can edit database
		return False  # self.pk == DEFAULT_PROFILE_ID

	def has_perm(self, perm, obj=None):
		return self.is_staff

	def has_module_perms(self, app_label):
		return self.is_staff

	username = CharField(max_length=30, blank=True, unique=True)
	name = CharField(max_length=30, blank=True, null=True)
	surname = CharField(max_length=30, blank=True)
	email = models.EmailField(blank=True)

	# specifies auth, create email, etc methods
	objects = BaseUserManager()

	birth_date = DateField(null=True, blank=True)
	contacts = CharField(null=True, max_length=100)
	bio = TextField(null=True)
	# fileField + <img instead of ImageField (removes preview link)
	photo = ImageField(upload_to=get_file_path)

	USERNAME_FIELD = 'username'

	email_verified = models.BooleanField(default=False)
	verify_code = models.CharField(max_length=17)
	# ISO/IEC 5218 1 male, 2 - female
	GENDER_CHOICES = ((1, 'Male'), (2, 'Female'))
	sex = models.SmallIntegerField(choices=GENDER_CHOICES)


class Messages(models.Model):
	"""
	Contains all public messages
	"""
	sender = models.ForeignKey(UserProfile, related_name='sender')
	#DateField.auto_now
	time = models.TimeField(default=datetime.datetime.now)
	content = models.CharField(max_length=255)
	id = models.AutoField(primary_key=True)
	receiver = models.ForeignKey(UserProfile, null=True, related_name='receiver')

	@property
	def json(self):
		return {
			'user': UserProfile.objects.get_by_natural_key(self.sender).username,
			'content': self.content,
			'time': self.time.strftime("%H:%M:%S"),
			'id': self.id
		}


class UserSettings(models.Model):
	"""
	Contains information about user customizable color settings
	"""
	user = models.OneToOneField(UserProfile, related_name='user_id', primary_key=True)
	text_color = models.CharField(max_length=6, null=True)
	self_text_color = models.CharField(max_length=6, null=True)
	others_text_color = models.CharField(max_length=6, null=True)
	private_text_color = models.CharField(max_length=6, null=True)
	background_color = models.CharField(max_length=6, null=True)