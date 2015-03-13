from django import forms
from story.models import UserSettings


class UserSettingsForm(forms.ModelForm):

	def __init__(self, *args, **kwargs):
		super(UserSettingsForm, self).__init__(*args, **kwargs)
		for field in self:
			field.field.widget.attrs['class'] = 'color'

	class Meta:  # pylint: disable=C1001
		model = UserSettings
		exclude = ('user',)
