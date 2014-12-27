from django import forms
from story.models import UserSettings


class UserSettingsForm(forms.ModelForm):

	class Meta:
		model = UserSettings
		exclude = ('user',)