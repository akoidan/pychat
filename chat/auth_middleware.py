from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from importlib import import_module
from redis_sessions.session import SessionStore

from chat.models import User

sessionStore = SessionStore()


class AuthorizationMiddleware(object):
    """
    Middleware to set user cookie
    If user is authenticated and there is no cookie, set the cookie,
    If the user is not authenticated and the cookie remains, delete it
    """
    def __init__(self):
        engine = import_module(settings.SESSION_ENGINE)
        self.SessionStore = engine.SessionStore

    def process_request(self, request):
        session_key = request.META.get('HTTP_SESSION_ID', None)
        if not hasattr(request, 'user'):
            if sessionStore.exists(session_key):
                request.session = SessionStore(session_key)
                user_id = int(request.session["_auth_user_id"])
                request.user = User.objects.get(id=user_id)
            else:
                request.user = AnonymousUser()
                # TODO
                request.session = SessionStore()
