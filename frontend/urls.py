from django.contrib import admin
from django.urls import path, re_path

from . import views
from .api import IdeaGroupList, group_view, ideas_for_group, post_idea

urlpatterns = [
    #API
    path('api/ideagroups/', IdeaGroupList.as_view(), name='ideagroup-list'),
    path('api/ideagroups/<int:group_id>/ideas', ideas_for_group, name='group-ideas'),
    path('api/ideagroups/<slug:slug>/', group_view, name='group-view'),
    path('api/ideas/', post_idea, name='post_idea'),

    # React
    re_path(r'^(?:.*)/?$', views.index, name='index'),

    # path('', views.index, name='index'),
    # path('api/ideagroups/', api.IdeaGroupList.as_view(), name='ideagroup-list'),
    # path('<slug>/', views.group_view, name='idea-group'),
]
