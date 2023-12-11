"""
WSGI config for ideazApp project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ideazApp.settings')

application = get_wsgi_application()

from whitenoise import WhiteNoise
application = WhiteNoise(application, root='frontend/static')