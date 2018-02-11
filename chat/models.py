import datetime
import time
from enum import Enum
from time import mktime

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.db import models
from django.db.models import CharField, DateField, FileField, BooleanField, URLField

from chat.log_filters import id_generator
from chat.settings import GENDERS, DEFAULT_PROFILE_ID, JS_CONSOLE_LOGS


def get_random_path(instance, filename):
	"""
	:param filename base string for generated name
	:return: a unique string filename
	"""
	return "{}_{}".format(id_generator(8), filename)


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


class Subscription(models.Model):
	user = models.ForeignKey(User, null=False)
	inactive = BooleanField(default=False, null=False)
	registration_id = models.CharField(null=False, max_length=191, unique=True)
	created = models.DateTimeField(default=datetime.datetime.now)


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
	# tho email max length is 254 characted mysql supports unique keys only 767 bytes long (utf8 4 bytes = 767/4 = 191)
	email = models.EmailField(null=True, unique=True, blank=True, max_length=190)
	city = CharField(max_length=50, null=True)

	birthday = DateField(null=True)
	contacts = CharField(max_length=100, null=True)
	# fileField + <img instead of ImageField (removes preview link)
	photo = FileField(upload_to=get_random_path, null=True)
	suggestions = BooleanField(null=False, default=True)
	cache_messages = BooleanField(null=False, default=True)
	embedded_youtube = BooleanField(null=False, default=True)
	highlight_code = BooleanField(null=False, default=False)
	logs = BooleanField(null=False, default=JS_CONSOLE_LOGS)
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
	# if symbol = null - no images refers this row
	# symbol is the same as "select max(symbol) from images where message_id = message.id
	# we store symbol in this table in case if user edits message
	# - images that refers same message always have unique symbols
	symbol = models.CharField(null=True, max_length=1)
	deleted = BooleanField(default=False)
	giphy = URLField(null=True)


class Image(models.Model):
	# character in Message.content that will be replaced with this image
	symbol = models.CharField(null=False, max_length=1)
	message = models.ForeignKey(Message, related_name='message', null=False)
	img = FileField(upload_to=get_random_path, null=True)

	class Meta:
		unique_together = ('symbol', 'message')


class RoomUsers(models.Model):
	room = models.ForeignKey(Room, null=False)
	user = models.ForeignKey(User, null=False)
	last_read_message = models.ForeignKey(Message, null=True)
	volume = models.IntegerField(default=2, null=False)
	notifications = BooleanField(null=False, default=True)

	class Meta:  # pylint: disable=C1001
		unique_together = ("user", "room")
		db_table = ''.join((User._meta.app_label, '_room_users'))


class SubscriptionMessages(models.Model):
	message = models.ForeignKey(Message, null=False)
	subscription = models.ForeignKey(Subscription, null=False)
	received = BooleanField(null=False, default=False)

	class Meta:  # pylint: disable=C1001
		unique_together = ("message", "subscription")
		db_table = ''.join((User._meta.app_label, '_subscription_message'))


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

	@property
	def info(self):
		if self.country is not None:
			return "{} {} ({})".format(self.country, self.city, self.isp)
		else:
			return ""


	class Meta:  # pylint: disable=C1001
		db_table = ''.join((User._meta.app_label, '_ip_address'))


class UserJoinedInfo(models.Model):
	ip = models.ForeignKey(IpAddress, null=True)
	user = models.ForeignKey(User, null=True)
	time = models.DateField(default=datetime.datetime.now)

	class Meta:  # pylint: disable=C1001
		db_table = ''.join((User._meta.app_label, '_user_joined_info'))
		unique_together = ("user", "ip")
