from django import forms
from django.forms import FileField, DateField, ChoiceField

from story.models import UserProfile


class DateWidget(forms.widgets.DateInput):
	"""
	Replace input in favor of html5 datepicker
	"""
	input_type = 'date'


class UserProfileForm(forms.ModelForm):
	# the widget gets rid of <a href=
	photo = FileField(widget=forms.FileInput)
	birthday = DateField(widget=DateWidget)  # input_formats=settings.DATE_INPUT_FORMATS
	GENDER_CHOICES = (
		(1, 'Male'),
		(2, 'Female'),
		(0, 'Alien'),
	)
	# implement here to set required = remove ---- choice in favor of alien
	sex = ChoiceField(required=True, choices=GENDER_CHOICES)

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'surname', 'email', 'birthday', 'contacts', 'sex', 'photo')


	def __init__(self, *args, **kwargs):
		"""
		Creates the entire form for changing UserProfile.
		"""
		super(UserProfileForm, self).__init__(*args, **kwargs)

		for key in self.fields:
			if key != 'username':
				self.fields[key].required = False