from django.contrib import admin
from .forms import IdeaGroupForm

# Register your models here.
from .models import IdeaGroup, Idea, Person, Organization

class IdeaGroupAdmin(admin.ModelAdmin):
    form = IdeaGroupForm 
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('name', 'description', 'status', 'slug')

    def display_organization(self, obj):
        return obj.organization.name
    display_organization.short_description = 'Organization'

admin.site.register(IdeaGroup, IdeaGroupAdmin)
admin.site.register(Idea)
admin.site.register(Person)
admin.site.register(Organization)