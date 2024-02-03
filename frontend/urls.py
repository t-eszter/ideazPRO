from django.contrib import admin
from django.urls import path, re_path
from dj_rest_auth.views import LoginView, LogoutView

from . import views
from .api import IdeaGroupList, GroupDetailView, ideas_for_group, IdeaAPIView, get_csrf_token, create_idea_group, ideas_for_guest, UpdateIdeaView, RegisterView

urlpatterns = [
    #API
    path('api/<str:organization_name>', IdeaGroupList.as_view(), name='ideagroup-list'), #Org home page
    path('api/<str:organization_name>/<slug:slug>/ideas', ideas_for_group, name='group-ideas'), #All ideas within one idea group
    path('api/<str:organization_name>/<slug:slug>', GroupDetailView.as_view(), name='group-detail'), #One Idea Group view within one org
    path('api/<str:organization_name>/create_idea_group/', create_idea_group, name='create_idea_group_for_org'), #Create new Idea Group for an org
    path('api/create_idea_group/', create_idea_group, name='create_idea_group_for_guest'), #Create new Idea Group for an org


    path('api/group/<uuid:id>/', ideas_for_guest, name='guest-user-view'),
    path('api/group/<uuid:idea_id>/like', UpdateIdeaView.as_view(), name='guest-user-view'),

    path('api/register/', RegisterView.as_view(), name='register'),


    path('api/ideas/', IdeaAPIView.as_view(), name='post_idea'),

    path('auth/login/', LoginView.as_view(), name='rest_login'),
    path('auth/logout/', LogoutView.as_view(), name='rest_logout'),

    # React
    re_path(r'^(?:.*)/?$', views.index, name='index'),

    #CSRF token
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'),
]
