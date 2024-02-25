from django.contrib import admin
from django.urls import path, re_path
from dj_rest_auth.views import LoginView, LogoutView

from . import views
from .api import *

urlpatterns = [
    #API
    # IdeaGroups for organization admins
    path('api/organizations/<str:organization_name>/ideagroups', IdeaGroupList.as_view(), name='ideagroups-list'),
    path('api/ideagroups', IdeaGroupCreateView.as_view(), name='ideagroup-create'),

    path('api/register', RegisterView.as_view(), name='register'),
    path('api/<str:organization_name>', IdeaGroupList.as_view(), name='ideagroup-list'), #Org home page
    path('api/<str:organization_name>/<slug:slug>/ideas', ideas_for_group, name='group-ideas'), #All ideas within one idea group
    path('api/<str:organization_name>/<slug:slug>', GroupDetailView.as_view(), name='group-detail'), #One Idea Group view within one org
    path('api/organizations/<uuid:organization_id>/members/', organization_members, name='organization_members'),
    path('api/idea-groups/<uuid:groupId>/', GroupDetailView.as_view(), name='group-detail'),
    path('api/<str:organization_name>/create_idea_group/', create_idea_group, name='create_idea_group_for_org'), #Create new Idea Group for an org
    path('api/create_idea_group/', create_idea_group, name='create_idea_group_for_guest'), #Create new Idea Group for an org
    path('api/person/<str:username>/', fetch_person_details, name='fetch_person_details'),

    # User settings
    path('api/person/settings/account/email', change_email, name='update_email'),
    path('api/person/settings/account/password/<int:user_id>', change_password, name='update_password'),
    path('api/person/settings/profile/<int:user_id>', update_person_details, name='update_person_details'),
    path('api/ideagroups/update/<uuid:pk>', IdeaGroupUpdateView.as_view(), name='ideagroup-update'),

    path('api/group/<uuid:id>/', ideas_for_guest, name='guest-user-view'),
    path('api/ideas/vote/<uuid:idea_id>', handle_vote, name='handle-vote'),

    path('api/ideas/', create_idea, name='post_idea'),

    path('auth/login/', login_view, name='custom_rest_login'),
    path('auth/logout/', LogoutView.as_view(), name='rest_logout'),

    path('api/organizations/<int:organization_id>/invite', send_invite, name='send_invite'),



    # React
    re_path(r'^(?:.*)/?$', views.index, name='index'),

    #CSRF token
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'),
]
