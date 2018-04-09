import logging

from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin

from chat import settings
from chat.socials import GoogleAuth, FacebookAuth
from chat.views import RegisterView, ProfileView, RestorePassword

logger = logging.getLogger(__name__)

admin.autodiscover()
urlpatterns = patterns(
	'',
	url(r'^admin/', include(admin.site.urls)),
	url(r'^$', 'chat.views.home'),  # url(r'^login$', 'story.views.login'),
	url(r'^logout$', 'chat.views.logout'),
	url(r'^auth$', 'chat.views.auth'),
	url(r'^register$', RegisterView.as_view(), name='register'),
	url(r'^confirm_email$', 'chat.views.confirm_email'),
	url(r'^google-auth', GoogleAuth.as_view()),
	url(r'^facebook-auth', FacebookAuth.as_view()),
	# story/register.js uses link below
	url(r'^validate_user$', 'chat.views.validate_user'),
	url(r'^register_fcb', 'chat.views.register_subscription'),
	url(r'^sw\.js$', 'chat.views.get_service_worker'),
	url(r'^get_firebase_playback', 'chat.views.get_firebase_playback'),
	url(r'^restore_password$', RestorePassword.as_view(), name='restore_pass'),
	url(r'^change_email$', 'chat.views.proceed_email_changed'),
	url(r'^send_restore_password$', 'chat.views.send_restore_password'),
	url(r'^validate_email$', 'chat.views.validate_email'),
	url(r'^profile$', ProfileView.as_view(), name='profile'),
	url(r'^profile/(\d{1,5})$', 'chat.views.show_profile'),
	url(r'^report_issue$', 'chat.views.report_issue'),
	url(r'^statistics$', 'chat.views.statistics'),
	url(r'^test$', 'chat.views.test'),
	url(r'^save_room_settings$', 'chat.views.save_room_settings'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
