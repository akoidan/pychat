from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf.urls.static import static

admin.autodiscover()
urlpatterns = patterns('',
		url(r'^admin/', include(admin.site.urls)),
		url(r'^(home)?$', 'story.views.home', name='home'),
		# url(r'^login$', 'story.views.login'),
		url(r'^logout$', 'story.views.logout'),
		url(r'^auth$', 'story.views.auth'),
		url(r'^register$', 'story.views.register'),
		url(r'^myshout$', 'story.views.myshout'),
		url(r'^alert$', 'story.views.shout'),
		url(r'^confirm_email$', 'story.views.confirmemail'),
		url(r'^bs$', 'story.views.bs'),
		url(r'^test$', 'story.views.test'),
)
