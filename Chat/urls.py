import os
import socket

from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin

from Chat import settings


#python2\3
try:
	from builtins import FileNotFoundError
except ImportError :
	FileNotFoundError = IOError
from django.core.exceptions import MiddlewareNotUsed
from Chat.settings import BASE_DIR, HOST_IP

# def check_redis_running():
# 	""":raise error if redis is not running"""
# 	try:
# 		result = call(["redis-cli", "ping"])
# 		if result != 0:
# 			print("Redis server is not running, trying to start in manually")
# 			# spout redis in background, shell= true finds command in PATH
# 			# subprocess.Popen(["redis"], shell=True)
# 			raise MiddlewareNotUsed("Can't establish connection with redis server. Please run `redis-server` command")
# 	except FileNotFoundError:
# 		raise MiddlewareNotUsed(
# 			"Can't find redis-cli. Probably redis in not installed or redis-cli is not in the PATH")

def check_ishout_running():
	""":raise error if IShout is not running"""
	sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	result = sock.connect_ex((HOST_IP, 5500))
	if result != 0:
		server_js = os.path.join(BASE_DIR, 'node_modules/ishout.js/server.js')
		raise MiddlewareNotUsed(
			"Can't establish connection with IShout.js. Please run `node " + server_js + '` command')
	# subprocess.Popen(["node", os.path.join(BASE_DIR, 'node_modules/ishout.js/server.js')])

# check_redis_running()
check_ishout_running()


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
	url(r'^get_messages$', 'story.views.get_messages'),
	url(r'^settings$', 'story.views.settings'),
	url(r'^refresh_user_list$', 'story.views.refresh_user_list'),
	url(r'^send_message$', 'story.views.send_message'),
	url(r'^profile$', 'story.views.get_profile'),
	url(r'^change_profile$', 'story.views.change_profile'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
