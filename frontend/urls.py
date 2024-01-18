from django.contrib import admin
from django.urls import path, re_path

from . import views
from .api import IdeaGroupList, GroupDetailView, ideas_for_group, IdeaAPIView, get_csrf_token, create_idea_group

urlpatterns = [
    #API
    path('api/ideagroups/', IdeaGroupList.as_view(), name='ideagroup-list'),
    path('api/ideagroups/<int:group_id>/ideas', ideas_for_group, name='group-ideas'),
    path('api/ideagroups/<slug:slug>/', GroupDetailView.as_view(), name='group-detail'),
    path('api/ideas/', IdeaAPIView.as_view(), name='post_idea'),
    path('api/create_idea_group/', views.create_idea_group, name='create_idea_group'),

    # React
    re_path(r'^(?:.*)/?$', views.index, name='index'),

    #CSRF token
    path('get-csrf-token/', get_csrf_token, name='get-csrf-token'),

    # path('', views.index, name='index'),
    # path('api/ideagroups/', api.IdeaGroupList.as_view(), name='ideagroup-list'),
    # path('<slug>/', views.group_view, name='idea-group'),
]
