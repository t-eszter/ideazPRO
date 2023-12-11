release: python manage.py migrate
web: gunicorn ideazApp.wsgi --log-file - --bind 0.0.0.0:$PORT