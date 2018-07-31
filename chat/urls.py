import logging

from django.contrib import admin
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from chat import settings
from chat.socials import GoogleAuth, FacebookAuth
from chat.views import RegisterView, RestorePassword

logger = logging.getLogger(__name__)
admin.autodiscover()

urlpatterns = patterns(
	'',
	url(r'^api/admin/', include(admin.site.urls)),
	url(r'^api/$', 'chat.views.home'),  # url(r'^login$', 'story.views.login'),
	url(r'^api/logout$', 'chat.views.logout'),
	url(r'^api/auth$', 'chat.views.auth'),
	url(r'^api/register$', RegisterView.as_view(), name='register'),
	url(r'^api/confirm_email$', 'chat.views.confirm_email'),
	url(r'^api/google-auth', GoogleAuth.as_view()),
	url(r'^api/facebook-auth', FacebookAuth.as_view()),
	# story/register.js uses link below
	url(r'^api/validate_user$', 'chat.views.validate_user'),
	url(r'^api/register_fcb', 'chat.views.register_subscription'),
	url(r'^api/sw\.js$', 'chat.views.get_service_worker'),
	url(r'^api/get_firebase_playback', 'chat.views.get_firebase_playback'),
	url(r'^api/change_password', 'chat.views.profile_change_password'),
	url(r'^api/restore_password$', RestorePassword.as_view(), name='restore_pass'),
	url(r'^api/change_email$', 'chat.views.proceed_email_changed'),
	url(r'^api/send_restore_password$', 'chat.views.send_restore_password'),
	url(r'^api/validate_email$', 'chat.views.validate_email'),
	url(r'^api/profile/(\d{1,5})$', 'chat.views.show_profile'),
	url(r'^api/report_issue$', 'chat.views.report_issue'),
	url(r'^api/upload_profile_image', 'chat.views.upload_profile_image'),
	url(r'^api/statistics$', 'chat.views.statistics'),
	url(r'^api/test$', 'chat.views.test'),
	url(r'^api/search_messages$', 'chat.views.search_messages'),
	url(r'^api/save_room_settings$', 'chat.views.save_room_settings'),
	url(r'^api/upload_file$', 'chat.views.upload_file'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
