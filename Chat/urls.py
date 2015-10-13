import logging

from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin

from Chat import settings

logger = logging.getLogger(__name__)

admin.autodiscover()
urlpatterns = patterns(
	'',
	url(r'^admin/', include(admin.site.urls)),
	url(r'^home$', 'Chat.views.home'),
	url(r'^$', 'Chat.views.home'),  # url(r'^login$', 'story.views.login'),
	url(r'^logout$', 'Chat.views.logout'),
	url(r'^auth$', 'Chat.views.auth'),
	url(r'^register$', 'Chat.views.register'),
	url(r'^register_page$', 'Chat.views.get_register_page'),
	url(r'^confirm_email$', 'Chat.views.confirm_email'),
	# story/register.js uses link below
	url(r'^validate_user$', 'Chat.views.validate_user'),
	url(r'^validate_email$', 'Chat.views.validate_email'),
	url(r'^profile$', 'Chat.views.change_profile'),
	url(r'^profile/(\d{1,5})$', 'Chat.views.show_profile'),
	url(r'^save_profile$', 'Chat.views.save_profile'),
	url(r'^report_issue$', 'Chat.views.report_issue'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
