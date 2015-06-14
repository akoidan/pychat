from django import forms
from django.forms import FileField

from story.models import UserProfile


class UserProfileForm(forms.ModelForm):
	"""
	A form that provides a way to edit UserProfile
	"""
	# the widget gets rid of <a href=
	photo = FileField(widget=forms.FileInput)

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'surname', 'email', 'birthday', 'contacts', 'sex', 'photo')

	def __init__(self, *args, **kwargs):
		"""
		Creates the entire form for changing UserProfile.
		"""
		#
		# self.helper = FormHelper()
		#
		# self.helper.add_input(Submit('Save', 'Save'))
		# fixme hardcoded url
		self.helper.form_action = '/change_profile'
		super(UserProfileForm, self).__init__(*args, **kwargs)

		for key in self.fields:
			if key != 'username':
				self.fields[key].required = False