from django.core.exceptions import ValidationError

def validation(func):
	def wrapper(self, *a, **ka):
		try:
			return func(self, *a, **ka)
		except ValidationError as e:
			message = e.message
			self.finish(message)
	return wrapper
