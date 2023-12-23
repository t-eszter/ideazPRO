from django.contrib import admin
from django.urls import path

from . import views
from . import api

from .views import index
# from .views import ideagroup_list

from .api import IdeaGroupList


urlpatterns = [
    #Public
    path('', views.index, name='index'),

    #API
    path('api/ideagroups/', api.IdeaGroupList.as_view(), name='ideagroup-list'),
    path('<slug>/', views.group_view, name='idea-group'),
]