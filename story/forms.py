from django import forms
from story.models import UserSettings


class UserSettingsForm(forms.ModelForm):

	class Meta:
		model = UserSettings
		fields = ('text_color', 'self_text_color', 'others_text_color')