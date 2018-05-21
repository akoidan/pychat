from django import forms
from django.forms import FileField, DateField, ChoiceField, Widget, BooleanField, CheckboxInput, PasswordInput

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


class PasswordWidget(PasswordInput):

	def render(self, name, value, attrs=None):
		return """<div>
							<label>Old password</label>
							<input id="id_old_password" type="password" name="old_password"/>
						</div>
						<div>
							<label>New password</label>
							<input id="id_password" type="password" name="password" minlength="3"/>
						</div>
						<div>
							<label>Confirm password</label>
							<input id="id_repeat_password" type="password" minlength="3"/>
						</div> """


class UserProfileForm(forms.ModelForm):
	# the widget gets rid of <a href=
	photo = FileField(widget=forms.FileInput)
	birthday = DateField(widget=DateWidget)  # input_formats=settings.DATE_INPUT_FORMATS
	suggestions = BooleanField(widget=BooleanWidget)
	logs = BooleanField(widget=BooleanWidget)
	embedded_youtube =BooleanField(widget=BooleanWidget)
	highlight_code = BooleanField(widget=BooleanWidget, help_text="```console.log('Highlight code like this')```")
	incoming_file_call_sound = BooleanField(widget=BooleanWidget)
	message_sound = BooleanField(widget=BooleanWidget)
	online_change_sound = BooleanField(widget=BooleanWidget)
	password = forms.CharField(widget=PasswordWidget)
	THEME_CHOICES = (
		('color-reg', 'Modern'),
		('color-lor', 'Simple'),
		('color-white', 'Light(Beta)'),
	)
	theme = ChoiceField(required=True, choices=THEME_CHOICES)
	GENDER_CHOICES = (
		(1, 'Male'),
		(2, 'Female'),
		(0, 'Alien'),
	)
	# implement here to set required = remove ---- choice in favor of alien
	sex = ChoiceField(required=True, choices=GENDER_CHOICES)

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'city', 'surname', 'email', 'birthday', 'contacts', 'sex', 'photo', 'suggestions', 'logs', 'embedded_youtube', 'highlight_code', 'message_sound', 'incoming_file_call_sound', 'online_change_sound', 'theme', 'password')

	def __init__(self, *args, **kwargs):
		"""
		Creates the entire form for changing UserProfile.
		"""
		super(UserProfileForm, self).__init__(*args, **kwargs)

		for key in self.fields:
			if key != 'username':
				self.fields[key].required = False
