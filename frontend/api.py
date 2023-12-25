from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import IdeaGroup, Idea
from .serializers import IdeaGroupSerializer, IdeaSerializer

class IdeaGroupList(generics.ListAPIView):
    queryset = IdeaGroup.objects.all()
    serializer_class = IdeaGroupSerializer

@api_view(['GET'])
def group_view(request, slug):
    idea_group = get_object_or_404(IdeaGroup, slug=slug)
    serializer = IdeaGroupSerializer(idea_group)
    return Response(serializer.data)

def ideagroup_list(request):
    ideagroups = IdeaGroup.objects.values('id', 'name')
    return JsonResponse({'ideagroups': list(ideagroups)}, safe=False)

def ideas_for_group(request, group_id):
    try:
        group = IdeaGroup.objects.get(id=group_id)
        ideas = Idea.objects.filter(group=group)
        serialized_ideas = IdeaSerializer(ideas, many=True).data
        return JsonResponse({'ideas': serialized_ideas})
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Group not found'}, status=404)
    except Exception as e:
        # Log the error for debugging
        print(e)
        return JsonResponse({'error': 'An error occurred'}, status=500)
