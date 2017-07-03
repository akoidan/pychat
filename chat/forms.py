from django import forms
from django.forms import FileField, DateField, ChoiceField, Widget, BooleanField, CheckboxInput

from chat.models import UserProfile
from chat.settings import GENDERS


class DateWidget(forms.widgets.DateInput):
	"""
	Replace input in favor of html5 datepicker
	"""
	input_type = 'date'


class OnlyTextWidget(Widget):
	def render(self, name, value, attrs=None):
		if name == 'sex':
			return GENDERS[value]
		else:
			return value


class UserProfileReadOnlyForm(forms.ModelForm):
	def __init__(self, *args, **kwargs):
		super(UserProfileReadOnlyForm, self).__init__(*args, **kwargs)
		for field in self:
				field.field.widget = OnlyTextWidget()

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'surname', 'city',  'email', 'birthday', 'contacts', 'sex')


class BooleanWidget(CheckboxInput):

	def render(self, name, value, attrs=None):
		return super(BooleanWidget, self).render(name, value, attrs) + '<label for="id_'+name+'"></label>'


class UserProfileForm(forms.ModelForm):
	# the widget gets rid of <a href=
	photo = FileField(widget=forms.FileInput)
	birthday = DateField(widget=DateWidget)  # input_formats=settings.DATE_INPUT_FORMATS
	notifications = BooleanField(widget=BooleanWidget)
	suggestions = BooleanField(widget=BooleanWidget)
	cache_messages = BooleanField(widget=BooleanWidget)
	logs = BooleanField(widget=BooleanWidget)

	GENDER_CHOICES = (
		(1, 'Male'),
		(2, 'Female'),
		(0, 'Alien'),
	)
	# implement here to set required = remove ---- choice in favor of alien
	sex = ChoiceField(required=True, choices=GENDER_CHOICES)

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'city', 'surname', 'email', 'birthday', 'contacts',
				'sex', 'photo', 'notifications', 'suggestions', 'logs', 'cache_messages')

	def __init__(self, *args, **kwargs):
		"""
		Creates the entire form for changing UserProfile.
		"""
		super(UserProfileForm, self).__init__(*args, **kwargs)

		for key in self.fields:
			if key != 'username':
				self.fields[key].required = False
