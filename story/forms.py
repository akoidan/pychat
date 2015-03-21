from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django import forms
from django.forms import ImageField

from story.models import UserSettings, UserProfile


class UserSettingsForm(forms.ModelForm):
	def __init__(self, *args, **kwargs):
		super(UserSettingsForm, self).__init__(*args, **kwargs)
		for field in self:
			field.field.widget.attrs['class'] = 'color'

	class Meta:  # pylint: disable=C1001
		model = UserSettings
		exclude = ('user',)


class UserProfileForm(forms.ModelForm):
	"""
	A form that provides a way to edit UserProfile
	"""
	# the widget gets rid of <a href=
	photo = ImageField(widget=forms.FileInput)

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'surname', 'email', 'birthday', 'contacts', 'sex', 'photo')

	def __init__(self, *args, **kwargs):
		"""
		Creates the entire form for changing UserProfile.
		"""

		self.helper = FormHelper()

		self.helper.add_input(Submit('Save', 'Save'))
		# fixme hardcoded url
		self.helper.form_action = '/change_profile'
		super(UserProfileForm, self).__init__(*args, **kwargs)

		for key in self.fields:
			if key != 'username':
				self.fields[key].required = False