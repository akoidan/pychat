import requests
from django.http import Http404, HttpResponse
from django.views.decorators.http import require_http_methods

from django.conf import settings


@require_http_methods('GET')
def notify(request):
	token = request.GET.get('token', False)
	if token != getattr(settings, "PUSHBULLET_PARAM"):
		raise Http404
	pushbullet("User has clicked on the link", "POE")
	return HttpResponse("User has been notified", content_type='text/plain')


def pushbullet(data, title):
	resp = requests.post('https://api.pushbullet.com/v2/pushes', json={
		'body': data,
		'type': 'note',
		'title': title
	}, headers={
		'Access-Token': getattr(settings, "PUSHBULLET_TOKEN"),
		'Content-Type': 'application/json'
	})
	if resp.status_code != 200:
		raise Exception(resp.content)
