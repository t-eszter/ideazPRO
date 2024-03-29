from django.contrib import admin
from django.urls import path, re_path
from dj_rest_auth.views import LoginView, LogoutView

from . import views
from .api import *

urlpatterns = [
    #CSRF token
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'),

    #API
    # accept invite
    path('api/invite/orgs/<uuid:organization_id>', RegisterFromInvite.as_view(), name='organization-detail'),
    path('api/invite/<uuid:organization_id>', send_invite, name='send_invite'),
    # path('invite/<uuid:organization_id>/accept', RegisterFromInvite.as_view(), name='register-from-invite'),

    # IdeaGroups for organization admins
    path('api/organizations/<str:organization_name>/ideagroups', IdeaGroupList.as_view(), name='ideagroups-list'),
    path('api/ideagroups', IdeaGroupCreateView.as_view(), name='ideagroup-create'),
    
    # update member's role for admins
    path('api/members/<int:member_id>/update-role', update_member_role, name='update-role'),

    #comments
    path('api/comments/<uuid:idea_id>', CommentsList.as_view(), name='comments-list'),
    path('api/comments/new/<uuid:idea_id>', CommentCreateView.as_view(), name='comments-list'), 

    #tags
    path('api/organizations/<uuid:organization_id>/tags', tag_cloud_view, name='tag-cloud'),

    #Hall of Fame view
    path('api/hall-of-fame/<uuid:organization_id>', hall_of_fame_view, name='hall_of_fame'),

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

    # React
    re_path(r'^(?:.*)/?$', views.index, name='index'),


]
