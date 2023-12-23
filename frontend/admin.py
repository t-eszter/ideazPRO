from django.contrib import admin
from .forms import IdeaGroupForm

# Register your models here.
from .models import IdeaGroup, Idea, Person

class IdeaGroupAdmin(admin.ModelAdmin):
    form = IdeaGroupForm  # Use the custom form for this admin class
    prepopulated_fields = {'slug': ('name',)}

admin.site.register(IdeaGroup, IdeaGroupAdmin)
admin.site.register(Idea)
admin.site.register(Person)