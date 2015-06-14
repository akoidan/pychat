from string import Template

from django import forms
from django.forms import FileField, CharField
from django.utils.safestring import mark_safe

from story.models import UserProfile


class DateWidget(forms.widgets.Textarea):
	"""
	The simple widget that renders the same html as the default one
	"""

	def render(self, name, value, attrs=None):
		html = Template("""
			<input id="id_birthday" type="date" value="$value">
		""")
		return mark_safe(html.substitute(value=value))


class UserProfileForm(forms.ModelForm):
	"""
	A form that provides a way to edit UserProfile
	"""
	# the widget gets rid of <a href=
	photo = FileField(widget=forms.FileInput)

	class Meta:  # pylint: disable=C1001
		model = UserProfile
		fields = ('username', 'name', 'surname', 'email', 'birthday', 'contacts', 'sex', 'photo')
		birthday2 = CharField(widget=DateWidget)

	def __init__(self, *args, **kwargs):
		"""
		Creates the entire form for changing UserProfile.
		"""
		super(UserProfileForm, self).__init__(*args, **kwargs)

		for key in self.fields:
			if key != 'username':
				self.fields[key].required = False