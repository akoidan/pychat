import datetime
import time
import uuid
from time import mktime

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.db import models
from django.db.models import CharField, DateField, FileField, BooleanField

from chat.settings import GENDERS


class User(AbstractBaseUser):
	def get_short_name(self):
		return self.name

	def get_full_name(self):
		return '%s %s' % (self.name, self.surname)

	@property
	def is_staff(self):
		# every registered user can edit database
		return self.pk == 1

	def has_perm(self, perm, obj=None):
		return self.is_staff

	def has_perms(self, perm, obj=None):
		return True

	def has_module_perms(self, app_label):
		return self.is_staff

	USERNAME_FIELD = 'username'
	username = CharField(max_length=30, null=False, unique=True)

	# specifies auth, create email, etc methods
	objects = BaseUserManager()

	# ISO/IEC 5218 1 male, 2 - female
	sex = models.SmallIntegerField(null=False)

	@property
	def sex_str(self):
		return GENDERS[self.sex]

	@sex_str.setter
	def sex_str(self, sex):
		if sex == 'Male':
			self.sex = 1
		elif sex == 'Female':
			self.sex = 2
		else:
			self.sex = 0


class UserProfile(User):

	def get_file_path(self, filename):
		"""
		:param filename base string for generated name
		:return: a unique string filename
		"""
		ext = filename.split('.')[-1]
		return "%s.%s" % (uuid.uuid4(), ext)

	name = CharField(max_length=30, null=True)

	surname = CharField(max_length=30, null=True)
	email = models.EmailField(null=True, unique=True, blank=True)
	city = CharField(max_length=50, null=True)

	birthday = DateField(null=True)
	contacts = CharField(max_length=100, null=True)
	# fileField + <img instead of ImageField (removes preview link)
	photo = FileField(upload_to=get_file_path, null=True)

	email_verified = models.BooleanField(default=False, null=False)
	verify_code = models.CharField(max_length=17, null=True)

	def save(self, *args, **kwargs):
		"""
		http://stackoverflow.com/questions/15422606/django-model-email-field-unique-if-not-null-blank
		"""
		if self.email is not None:
			self.email.lower().strip()  # Hopefully reduces junk to ""
			if self.email == "":
				self.email = None
		super(UserProfile, self).save(*args, **kwargs)


class Room(models.Model):
	name = CharField(max_length=30, null=True, unique=True)
	users = models.ManyToManyField(User, related_name='rooms')
	is_private = BooleanField(default=True)


def get_milliseconds(dt=None):
	if dt is None:
		return int(time.time()*1000)
	if dt.time.timestamp:
		return int(dt.time.timestamp()*1000)
	else:
		return mktime(dt.time.timetuple()) * 1000 + int(dt.time.microsecond / 1000)


class Message(models.Model):
	"""
	Contains all public messages
	"""
	sender = models.ForeignKey(User, related_name='sender')
	room = models.ForeignKey(Room, null=True)
	# DateField.auto_now
	time = models.BigIntegerField(default=get_milliseconds)
	content = models.TextField()
	is_raw = models.BooleanField(default=True, null=False)
	receiver = models.ForeignKey(User, null=True, related_name='receiver')


class Issue(models.Model):
	content = models.TextField(null=False)  # unique = true, but mysql doesnt allow unique fields for unspecified size


class IssueDetails(models.Model):
	sender = models.ForeignKey(User, null=True, blank=True)
	email = models.EmailField(null=True, blank=True)
	browser = models.CharField(null=False, max_length=32)
	time = models.DateField(default=datetime.datetime.now, blank=True)
	issue = models.ForeignKey(Issue, related_name='issue')
	log = models.TextField(null=True)

	class Meta:  # pylint: disable=C1001
		db_table = ''.join((User._meta.app_label, '_issue_detail'))


class IpAddress(models.Model):
	user = models.ForeignKey(User, null=True)
	anon_name = models.CharField(null=True, max_length=32)
	time = models.DateField(default=datetime.datetime.now)
	ip = models.CharField(null=False, max_length=32)
	isp = models.CharField(null=True, max_length=32)
	country = models.CharField(null=True, max_length=32)
	region = models.CharField(null=True, max_length=32)
	city = models.CharField(null=True, max_length=32)

	class Meta:
		db_table = ''.join((User._meta.app_label, '_ip_address'))
		unique_together = ("user", "ip", "anon_name")
