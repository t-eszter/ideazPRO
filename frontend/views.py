from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import IdeaGroup

# Create your views here.

def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def ideagroup_list(request):
    ideagroups = IdeaGroup.objects.values('id', 'name')
    return JsonResponse({'ideagroups': list(ideagroups)}, safe=False)

def group_view(request, slug):
    # Retrieve the idea group based on the slug, or return a 404 page if not found
    idea_group = get_object_or_404(IdeaGroup, slug=slug)

    # You can now use the 'idea_group' object in your template or return a response
    # with the details of the idea group
    context = {
        'idea_group': idea_group,
    }

    return render(request, 'frontend/index.html', context)