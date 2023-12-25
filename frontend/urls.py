from django.contrib import admin
from django.urls import path, re_path

from . import views
from . import api

from .views import index
from .api import IdeaGroupList, ideas_for_group


urlpatterns = [
    #API
    path('api/ideagroups/', api.IdeaGroupList.as_view(), name='ideagroup-list'),
    path('api/ideagroups/<int:group_id>/ideas', ideas_for_group, name='group-ideas'),

    #React
    re_path(r'^(?:.*)/?$', views.index, name='index'),


    # path('', views.index, name='index'),
    # path('api/ideagroups/', api.IdeaGroupList.as_view(), name='ideagroup-list'),
    # path('<slug>/', views.group_view, name='idea-group'),
]