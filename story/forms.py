from django import forms
from story.models import UserSettings


class UserSettingsForm(forms.ModelForm):

	class Meta:
		model = UserSettings
		exclude = ('user',)
		widgets = {
			'text_color': forms.TextInput(attrs={'class': 'color'}),
			'private_text_color': forms.TextInput(attrs={'class': 'color'}),
			'others_text_color': forms.TextInput(attrs={'class': 'color'}),
			'self_text_color': forms.TextInput(attrs={'class': 'color'}),
		}
