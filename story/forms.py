from django import forms
from django.forms import ImageField, CharField
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
		exclude = ('email_verified', 'verify_code', 'password')