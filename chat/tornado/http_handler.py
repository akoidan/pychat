from tornado.web import RequestHandler
from django.conf import settings


class HttpHandler(RequestHandler):

    def get(self):
        self.write(settings.VALIDATION_IS_OK)
