import datetime
import time
import uuid
from enum import Enum
from time import mktime

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.db import models
from django.db.models import CharField, DateField, FileField, BooleanField

from chat.log_filters import id_generator
from chat.settings import GENDERS, DEFAULT_PROFILE_ID


def get_random_path(instance, filename):
	"""
	:param filename base string for generated name
	:return: a unique string filename
	"""
	ext = filename.split('.')[-1]
	return "%s.%s" % (uuid.uuid4(), ext)


class User(AbstractBaseUser):
	def get_short_name(self):
		return self.username

	def get_full_name(self):
		return self.username

	@property
	def is_staff(self):
		# every registered user can edit database
		return self.pk == DEFAULT_PROFILE_ID

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
	sex = models.SmallIntegerField(null=False, default=0)

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


class Verification(models.Model):

	class TypeChoices(Enum):
		register = 'r'
		password = 'p'

	# a - account activation, r - recover
	type = models.CharField(null=False, max_length=1)
	token = models.CharField(max_length=17, null=False, default=id_generator)
	user = models.ForeignKey(User, null=False)
	time = models.DateTimeField(default=datetime.datetime.now)
	verified = BooleanField(default=False)

	@property
	def type_enum(self):
		return self.TypeChoices(self.type)

	@type_enum.setter
	def type_enum(self, p_type):
		"""
		:type p_type: Verification.TypeChoices
		"""
		self.type = p_type.value


class UserProfile(User):
	name = CharField(max_length=30, null=True)

	surname = CharField(max_length=30, null=True)
	email = models.EmailField(null=True, unique=True, blank=True)
	city = CharField(max_length=50, null=True)

	birthday = DateField(null=True)
	contacts = CharField(max_length=100, null=True)
	# fileField + <img instead of ImageField (removes preview link)
	photo = FileField(upload_to=get_random_path, null=True)
	suggestions = BooleanField(null=False, default=True)
	notifications = BooleanField(null=False, default=True)
	# TODO, save theme in profile? theme_name = CharField(max_length=16, null=True)

	email_verification = models.ForeignKey(Verification, null=True)

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
	name = CharField(max_length=16, null=True)
	users = models.ManyToManyField(User, related_name='rooms', through='RoomUsers')
	disabled = BooleanField(default=False, null=False)

	@property
	def is_private(self):
		return self.name is None


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
	content = models.TextField(null=True)
	img = FileField(upload_to=get_random_path, null=True)
	deleted = BooleanField(default=False)


class RoomUsers(models.Model):
	room = models.ForeignKey(Room, null=False)
	user = models.ForeignKey(User, null=False)
	last_read_message = models.ForeignKey(Message, null=True)

	class Meta:  # pylint: disable=C1001
		unique_together = ("user", "room")
		db_table = ''.join((User._meta.app_label, '_room_users'))


class Issue(models.Model):
	content = models.TextField(null=False)  # unique = true, but mysql doesnt allow unique fields for unspecified size

	def __str__(self):
		return self.content


class IssueDetails(models.Model):
	sender = models.ForeignKey(User, null=False	)
	browser = models.CharField(null=False, max_length=32)
	time = models.DateField(default=datetime.datetime.now, blank=True)
	issue = models.ForeignKey(Issue, related_name='issue')
	log = models.TextField(null=True)

	class Meta:  # pylint: disable=C1001
		db_table = ''.join((User._meta.app_label, '_issue_detail'))


class IpAddress(models.Model):
	ip = models.CharField(null=False, max_length=32, unique=True)
	isp = models.CharField(null=True, max_length=32)
	country_code = models.CharField(null=True, max_length=16)
	country = models.CharField(null=True, max_length=32)
	region = models.CharField(null=True, max_length=32)
	city = models.CharField(null=True, max_length=32)

	def __str__(self):
		return self.ip

	class Meta:  # pylint: disable=C1001
		db_table = ''.join((User._meta.app_label, '_ip_address'))


class UserJoinedInfo(models.Model):
	ip = models.ForeignKey(IpAddress, null=True)
	user = models.ForeignKey(User, null=True)
	time = models.DateField(default=datetime.datetime.now)

	class Meta:  # pylint: disable=C1001
		db_table = ''.join((User._meta.app_label, '_user_joined_info'))
		unique_together = ("user", "ip")
