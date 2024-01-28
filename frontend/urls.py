from django.contrib import admin
from django.urls import path, re_path

from . import views
from .api import IdeaGroupList, GroupDetailView, ideas_for_group, IdeaAPIView, get_csrf_token, create_idea_group

urlpatterns = [
    #API
    path('api/<str:organization_name>', IdeaGroupList.as_view(), name='ideagroup-list'), #Org home page
    path('api/<str:organization_name>/<slug:slug>/ideas', ideas_for_group, name='group-ideas'), #All ideas within one idea group
    path('api/<str:organization_name>/<slug:slug>', GroupDetailView.as_view(), name='group-detail'), #One Idea Group view within one org
    path('api/<str:organization_name>/create_idea_group/', create_idea_group, name='create_idea_group'), #Create new Idea Group for an org
    path('<uuid:id>', create_idea_group, name='guest-user-view'),

    path('api/ideas/', IdeaAPIView.as_view(), name='post_idea'),

    # React
    re_path(r'^(?:.*)/?$', views.index, name='index'),

    #CSRF token
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'),
]
