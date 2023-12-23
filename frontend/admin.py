from django.contrib import admin

# Register your models here.
from .models import IdeaGroup, Idea, Person

class IdeaGroupAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}  # Automatically populate slug from name

admin.site.register(IdeaGroup, IdeaGroupAdmin)
admin.site.register(Idea)
admin.site.register(Person)