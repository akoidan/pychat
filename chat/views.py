# -*- encoding: utf-8 -*-
import datetime
import json

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth import login as djangologin
from django.contrib.auth import logout as djangologout
from django.core.mail import send_mail

try:
	from django.template.context_processors import csrf
except ImportError:
	from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import transaction
from django.db.models import Count, Q
from django.http import Http404
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.http import require_http_methods
from django.views.generic import View

from chat import utils
from chat.decorators import login_required_no_redirect
from chat.forms import UserProfileForm, UserProfileReadOnlyForm
from chat.models import Issue, IssueDetails, IpAddress, UserProfile, Verification
from chat.settings import VALIDATION_IS_OK, DATE_INPUT_FORMATS_JS, logging, SITE_PROTOCOL
from chat.utils import hide_fields, check_user, check_password, check_email, extract_photo, send_email_verification, \
	create_user_profile, check_captcha

logger = logging.getLogger(__name__)


# TODO doesn't work
def handler404(request):
	return HttpResponse("Page not found", content_type='text/plain')


@require_http_methods(['POST'])
def validate_email(request):
	"""
	POST only, validates email during registration
	"""
	email = request.POST.get('email')
	try:
		utils.check_email(email)
		response = VALIDATION_IS_OK
	except ValidationError as e:
		response = e.message
	return HttpResponse(response, content_type='text/plain')


@require_http_methods(['GET'])
def update_session_key(request):
	"""
	Creates a new session key, saves it to session store and to response
	"""
	old_key = request.session.session_key
	request.session.create()  # updates the session_key
	logger.info("Session key %s has been updated to %s", old_key, request.session.session_key)
	request.session.modified = True
	return HttpResponse(VALIDATION_IS_OK, content_type='text/plain')


@require_http_methods('POST')
def validate_user(request):
	"""
	Validates user during registration
	"""
	try:
		username = request.POST.get('username')
		utils.check_user(username)
		# hardcoded ok check in register.js
		message = VALIDATION_IS_OK
	except ValidationError as e:
		message = e.message
	return HttpResponse(message, content_type='text/plain')


@require_http_methods('GET')
@login_required_no_redirect(False)
def home(request):
	"""
	Login or logout navbar is creates by means of create_nav_page
	@return:  the x intercept of the line M{y=m*x+b}.
	"""
	return render_to_response('chat.html', csrf(request), context_instance=RequestContext(request))


@login_required_no_redirect()
def logout(request):
	"""
	POST. Logs out into system.
	"""
	djangologout(request)
	response = HttpResponseRedirect('/')
	return response


@require_http_methods(['POST'])
def auth(request):
	"""
	Logs in into system.
	"""
	username = request.POST.get('username')
	password = request.POST.get('password')
	user = authenticate(username=username, password=password)
	if user is not None:
		djangologin(request, user)
		message = VALIDATION_IS_OK
	else:
		message = 'Login or password is wrong'
	logger.debug('Auth request %s ; Response: %s', hide_fields(request.POST, 'password'), message)
	response = HttpResponse(message, content_type='text/plain')
	return response


def send_restore_password(request):
	"""
	Sends email verification code
	"""
	logger.debug('Recover password request %s', request)
	try:
		username_or_password = request.POST.get('username_or_password')
		check_captcha(request)
		user_profile = UserProfile.objects.get(Q(username=username_or_password) | Q(email=username_or_password))
		if not user_profile.email:
			raise ValidationError("You didn't specify email address for this user")
		if not user_profile.email_verification_id or not user_profile.email_verification.verified:
			raise ValidationError("You didn't verify the email after registration. "
					"Find you verification email and complete verification and after restore the password again")
		verification = Verification(type_enum=Verification.TypeChoices.password, user_id=user_profile.id)
		verification.save()
		message = "{},\n" \
			"You requested to change a password on site {}.\n" \
			"To proceed click on the link {}://{}/restore_password?token={}\n" \
			"If you didn't request the password change just ignore this mail" \
			.format(user_profile.username, request.get_host(), SITE_PROTOCOL, request.get_host(), verification.token)
		send_mail("Change password", message, request.get_host(), (user_profile.email,), fail_silently=False)
		message = VALIDATION_IS_OK
		logger.debug('Verification email has been send for token %s to user %s(id=%d)',
				verification.token, user_profile.username, user_profile.id)
	except UserProfile.DoesNotExist:
		message = "User with this email or username doesn't exist"
		logger.debug("Skipping password recovery request for nonexisting user")
	except (UserProfile.DoesNotExist, ValidationError) as e:
		logger.debug('Not sending verification email because %s', e)
		message = 'Unfortunately we were not able to send you restore password email because {}'.format(e)
	return HttpResponse(message, content_type='text/plain')


class RestorePassword(View):

	def get_user_by_code(self, token):
		"""
		:param token: token code to verify
		:type token: str
		:raises ValidationError: if token is not usable
		:return: UserProfile, Verification: if token is usable
		"""
		try:
			v = Verification.objects.get(token=token)
			if v.type_enum != Verification.TypeChoices.password:
				raise ValidationError("it's not for this operation ")
			if v.verified:
				raise ValidationError("it's already used")
			# TODO move to sql query or leave here?
			if v.time < datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1):
				raise ValidationError("it's expired")
			return UserProfile.objects.get(id=v.user_id), v
		except Verification.DoesNotExist:
			raise ValidationError('Unknown verification token')

	@transaction.atomic
	def post(self, request):
		"""
		Sends email verification token
		"""
		token = request.POST.get('token', False)
		try:
			logger.debug('Proceed Recover password with token %s', token)
			user, verification = self.get_user_by_code(token)
			password = request.POST.get('password')
			check_password(password)
			user.set_password(password)
			user.save(update_fields=('password',))
			verification.verified = True
			verification.save(update_fields=('verified',))
			logger.info('Password has been change for token %s user %s(id=%d)', token, user.username, user.id)
			response = VALIDATION_IS_OK
		except ValidationError as e:
			logger.debug('Rejecting verification token %s because %s', token, e)
			response = "".join(("You can't reset password with this token because ", str(e)))
		return HttpResponse(response, content_type='text/plain')

	def get(self, request):
		token = request.GET.get('token', False)
		logger.debug('Rendering restore password page with token  %s', token)
		try:
			user, verification = self.get_user_by_code(token)
			response = {
				'message': VALIDATION_IS_OK,
				'restore_user': user.username,
				'token': token
			}
		except ValidationError as e:
			logger.debug('Rejecting verification token %s because %s', token, e)
			response = {'message': "Unable to confirm email with token {} because {}".format(token, e)}
		return render_to_response('reset_password.html', response, context_instance=RequestContext(request))


@require_http_methods('GET')
def confirm_email(request):
	"""
	Accept the verification token sent to email
	"""
	token = request.GET.get('token', False)
	logger.debug('Processing email confirm with token  %s', token)
	try:
		try:
			v = Verification.objects.get(token=token)
		except Verification.DoesNotExist:
			raise ValidationError('Unknown verification token')
		if v.type_enum != Verification.TypeChoices.register:
			raise ValidationError('This is not confirm email token')
		if v.verified:
			raise ValidationError('This verification token already accepted')
		user = UserProfile.objects.get(id=v.user_id)
		if user.email_verification_id != v.id:
			raise ValidationError('Verification token expired because you generated another one')
		v.verified = True
		v.save(update_fields=['verified'])
		message = VALIDATION_IS_OK
		logger.info('Email verification token %s has been accepted for user %s(id=%d)', token, user.username, user.id)
	except Exception as e:
		logger.debug('Rejecting verification token %s because %s', token, e)
		message = ("Unable to confirm email with token {} because {}".format(token, e))
	response = {'message': message}
	return render_to_response('confirm_mail.html', response, context_instance=RequestContext(request))


@require_http_methods('GET')
def show_profile(request, profile_id):
	try:
		user_profile = UserProfile.objects.get(pk=profile_id)
		form = UserProfileReadOnlyForm(instance=user_profile)
		form.username = user_profile.username
		return render_to_response(
			'show_profile.html',
			{'form': form},
			context_instance=RequestContext(request)
		)
	except ObjectDoesNotExist:
		raise Http404


@require_http_methods('GET')
def statistics(request):
	pie_data = IpAddress.objects.values('country').filter(country__isnull=False).annotate(count=Count("country"))
	return render_to_response(
		'statistic.html',
		{'dataProvider': json.dumps(list(pie_data))},
		context_instance=RequestContext(request)
	)


class IssueView(View):

	def get(self, request):
		return render_to_response(
			'issue.html',  # getattr for anonymous.email
			{'email': getattr(request.user, 'email', '')},
			context_instance=RequestContext(request)
		)

	@transaction.atomic
	def post(self, request):
		logger.info('Saving issue: %s', hide_fields(request.POST, 'log', huge=True))
		issue = Issue.objects.get_or_create(content=request.POST['issue'])[0]
		issue_details = IssueDetails(
			sender_id=request.user.id,
			email=request.POST.get('email'),
			browser=request.POST.get('browser'),
			issue=issue,
			log=request.POST.get('log')
		)
		issue_details.save()
		return HttpResponse(VALIDATION_IS_OK, content_type='text/plain')


class ProfileView(View):

	@login_required_no_redirect(True)
	def get(self, request):
		user_profile = UserProfile.objects.get(pk=request.user.id)
		form = UserProfileForm(instance=user_profile)
		c = csrf(request)
		c['form'] = form
		c['date_format'] = DATE_INPUT_FORMATS_JS
		return render_to_response('change_profile.html', c, context_instance=RequestContext(request))

	@login_required_no_redirect()
	def post(self, request):
		logger.info('Saving profile: %s', hide_fields(request.POST, "base64_image", huge=True))
		user_profile = UserProfile.objects.get(pk=request.user.id)
		image_base64 = request.POST.get('base64_image')

		if image_base64 is not None:
			image = extract_photo(image_base64)
			request.FILES['photo'] = image

		form = UserProfileForm(request.POST, request.FILES, instance=user_profile)
		if form.is_valid():
			profile = form.save()
			response = profile. photo.url if 'photo' in  request.FILES else VALIDATION_IS_OK
		else:
			response = form.errors
		return HttpResponse(response, content_type='text/plain')


class RegisterView(View):

	def get(self, request):
		c = csrf(request)
		c['noNav'] = True
		c['captcha'] = getattr(settings, "RECAPTCHA_SITE_KEY", None)
		logger.debug('Rendering register page with captcha site key ', c['captcha'])
		c['captcha_url'] = getattr(settings, "RECAPTHCA_SITE_URL", None)
		return render_to_response("register.html", c, context_instance=RequestContext(request))

	@transaction.atomic
	def post(self, request):
		try:
			rp = request.POST
			logger.info('Got register request %s', hide_fields(rp, 'password', 'repeatpassword'))
			(username, password, email) = (rp.get('username'), rp.get('password'), rp.get('email'))
			check_user(username)
			check_password(password)
			check_email(email)
			user_profile = create_user_profile(email, password, rp.get('sex'), username)
			# You must call authenticate before you can call login
			auth_user = authenticate(username=username, password=password)
			message = VALIDATION_IS_OK  # redirect
			if email:
				send_email_verification(user_profile, request.get_host())
			djangologin(request, auth_user)
		except ValidationError as e:
			message = e.message
			logger.debug('Rejecting request because "%s"', message)
		return HttpResponse(message, content_type='text/plain')
