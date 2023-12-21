from django.contrib import admin

# Register your models here.
from .models import IdeaGroup, Idea, Person

admin.site.register(IdeaGroup)
admin.site.register(Idea)
admin.site.register(Person)