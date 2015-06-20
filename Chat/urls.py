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
	url(r'^home$', 'story.views.home'),
	url(r'^$', 'story.views.home'),  # url(r'^login$', 'story.views.login'),
	url(r'^logout$', 'story.views.logout'),
	url(r'^auth$', 'story.views.auth'),
	url(r'^register$', 'story.views.register'),
	url(r'^register_page$', 'story.views.get_register_page'),
	url(r'^confirm_email$', 'story.views.confirm_email'),
	# story/register.js uses link below
	url(r'^validate_user$', 'story.views.validate_user'),
	url(r'^validate_email$', 'story.views.validate_email'),
	url(r'^profile$', 'story.views.get_profile'),
	url(r'^profile/(\d{1,5})$', 'story.views.show_profile'),
	url(r'^save_profile$', 'story.views.save_profile'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
