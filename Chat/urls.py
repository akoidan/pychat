from subprocess import call
import logging

from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.core.exceptions import MiddlewareNotUsed

from Chat import settings


logger = logging.getLogger(__name__)

def check_redis_running():
	""":raise error if redis is not running"""
	try:
		result = call(["redis-cli", "ping"])
		if result != 0:
			# spout redis in background, shell= true finds command in PATH
			# subprocess.Popen(["redis"], shell=True)
			raise MiddlewareNotUsed("Can't establish connection with redis server. Please run `redis-server` command")
	except FileNotFoundError:
		logger.error("Can't find redis-cli. Probably redis in not installed or redis-cli is not in the PATH")

# check redis in url for lazy init and running only once and not in test or custom command
check_redis_running()

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
	url(r'^settings$', 'story.views.user_settings'),
	url(r'^profile$', 'story.views.get_profile'),
	url(r'^change_profile$', 'story.views.change_profile'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
