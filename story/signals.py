from django.contrib.auth.signals import user_logged_in, user_logged_out
from story.logic import refresh_user_list


user_logged_in.connect(refresh_user_list)
user_logged_out.connect(refresh_user_list)