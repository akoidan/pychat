import uuid
import datetime

from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.db.models import CharField, DateField, FileField, TextField


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

	def has_perms(self, perm, obj=None):
		return True

	def has_module_perms(self, app_label):
		return self.is_staff

	USERNAME_FIELD = 'username'
	username = CharField(max_length=30, null=False, unique=True)
	name = CharField(max_length=30, null=True)
	surname = CharField(max_length=30, null=True)
	email = models.EmailField(null=True, unique=True, blank=True)

	# specifies auth, create email, etc methods
	objects = BaseUserManager()

	birthday = DateField(null=True)
	contacts = TextField(max_length=100, null=True)
	# fileField + <img instead of ImageField (removes preview link)
	photo = FileField(upload_to=get_file_path, null=True)

	email_verified = models.BooleanField(default=False, null=False)
	verify_code = models.CharField(max_length=17, null=True)
	# ISO/IEC 5218 1 male, 2 - female

	sex = models.SmallIntegerField(null=False)

	@property
	def sex_str(self):
		return {
			0: None,
			1: 'Male',
			2: 'Female',
		}[self.sex]

	@sex_str.setter
	def sex_str(self, sex):
		if sex == 'Male':
			self.sex = 1
		elif sex == 'Female':
			self.sex = 2
		else:
			self.sex = 0

	def save(self, *args, **kwargs):
		"""
		http://stackoverflow.com/questions/15422606/django-model-email-field-unique-if-not-null-blank
		"""
		if self.email is not None:
			self.email.lower().strip()  # Hopefully reduces junk to ""
			if self.email == "":
				self.email = None
		super(UserProfile, self).save(*args, **kwargs)


class Messages(models.Model):
	"""
	Contains all public messages
	"""
	sender = models.ForeignKey(UserProfile, related_name='sender')
	# DateField.auto_now
	time = models.TimeField(default=datetime.datetime.now)
	content = models.CharField(max_length=255)
	id = models.AutoField(primary_key=True)
	receiver = models.ForeignKey(UserProfile, null=True, related_name='receiver')