from django.shortcuts import render
from django.http import JsonResponse
from .models import IdeaGroup

# Create your views here.

def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def ideagroup_list(request):
    ideagroups = IdeaGroup.objects.values('id', 'name')
    return JsonResponse({'ideagroups': list(ideagroups)}, safe=False)
