from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from .models import IdeaGroup, Idea, Person
from .serializers import IdeaGroupSerializer, IdeaSerializer
from rest_framework.permissions import AllowAny
import subprocess
import os
from django.conf import settings

import subprocess

def check_profanity(text):
    profanity_script = os.path.join(settings.BASE_DIR, 'frontend', 'profanity.mjs')
    result = subprocess.run(['node', profanity_script, text], capture_output=True, text=True)
    print("Node.js script output:", result.stdout)
    return "Profanity detected!" in result.stdout

# api.py
class IdeaGroupList(generics.ListAPIView):
    queryset = IdeaGroup.objects.all()
    serializer_class = IdeaGroupSerializer

# api.py
class GroupDetailView(RetrieveAPIView):
    queryset = IdeaGroup.objects.all()
    serializer_class = IdeaGroupSerializer
    lookup_field = 'slug'

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

class IdeaAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()  # create mutable copy of request data

        #Person
        # handle case where person is "null"
        if data.get('person') == 'null':
            data['person'] = None

        #IdeaGroup
        group_id = data.get('group')
        if not group_id:
            return Response({'error': 'Group ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # validate if the group exists
            IdeaGroup.objects.get(id=group_id)
        except IdeaGroup.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_400_BAD_REQUEST)

        # Profanity Check
        description = data.get('description', '')
        if check_profanity(description):
            return Response({'error': 'Your idea description contains profanity. Please be respectful and rephrase your message.'}, status=status.HTTP_400_BAD_REQUEST)

        #Idea
        serializer = IdeaSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes((AllowAny,))
def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})