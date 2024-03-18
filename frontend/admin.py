from django.contrib import admin
from .forms import IdeaGroupForm

# Register your models here.
from .models import IdeaGroup, Idea, Person, Organization, Vote, Tag

class IdeaGroupAdmin(admin.ModelAdmin):
    form = IdeaGroupForm 
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('id','name', 'description', 'status', 'slug', 'display_organization')

    def display_organization(self, obj):
        return obj.organization.name if obj.organization else "No Organization"
    display_organization.short_description = 'Organization'

class IdeaAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'postedDate', 'group', 'person', 'display_tags', 'display_organization')

    def display_tags(self, obj):
        """Concatenates and displays all tags related to an idea."""
        return ", ".join([tag.name for tag in obj.tags.all()])
    display_tags.short_description = 'Tags'

    def display_organization(self, obj):
        """Displays the organization name of the idea's group, if available."""
        if obj.group and obj.group.organization:
            return obj.group.organization.name
        return "No Organization"
    display_organization.short_description = 'Organization'

    search_fields = ('title', 'description', 'person__name', 'group__name', 'tags__name')
    list_filter = ('postedDate', 'group', 'tags')

class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'idea', 'vote_type', 'display_idea_title')
    
    def display_idea_title(self, obj):
        return obj.idea.title
    display_idea_title.short_description = 'Idea Title'


class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name') 

class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

admin.site.register(IdeaGroup, IdeaGroupAdmin)
admin.site.register(Idea, IdeaAdmin)
admin.site.register(Person)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(Vote, VoteAdmin)
admin.site.register(Tag, TagAdmin)