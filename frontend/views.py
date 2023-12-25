from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import IdeaGroup, Idea
from .serializers import IdeaGroupSerializer
from rest_framework.decorators import api_view

# Create your views here.

def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def ideagroup_list(request):
    ideagroups = IdeaGroup.objects.values('id', 'name')
    return JsonResponse({'ideagroups': list(ideagroups)}, safe=False)

@api_view(['GET'])
def group_view(request, slug):
    idea_group = get_object_or_404(IdeaGroup, slug=slug)
    serializer = IdeaGroupSerializer(idea_group)
    return Response(serializer.data)

def ideas_for_group(request, group_id):
    try:
        group = IdeaGroup.objects.get(id=group_id)
        ideas = Idea.objects.filter(idea_group=group)  # Adjust based on your model relations
        # Serialize your ideas here
        return JsonResponse({'ideas': serialized_ideas})
    except IdeaGroup.DoesNotExist:
        return JsonResponse({'error': 'Group not found'}, status=404)