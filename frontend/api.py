from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from .models import IdeaGroup, Idea, Person, Organization
from .serializers import IdeaGroupSerializer, IdeaSerializer, IdeaUpdateSerializer
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
    serializer_class = IdeaGroupSerializer

    def get_queryset(self):
        organization_name = self.kwargs.get('organization_name')
        return IdeaGroup.objects.filter(organization__name=organization_name)

# api.py
class GroupDetailView(RetrieveAPIView):
    serializer_class = IdeaGroupSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        organization_name = self.kwargs.get('organization_name')
        return IdeaGroup.objects.filter(organization__name=organization_name)

@api_view(['GET'])
def ideas_for_group(request, organization_name, slug):
    try:
        organization = Organization.objects.get(name=organization_name)
        group = IdeaGroup.objects.get(slug=slug, organization=organization)
        ideas = Idea.objects.filter(group=group)
        serialized_ideas = IdeaSerializer(ideas, many=True).data
        return JsonResponse({'ideas': serialized_ideas})
    except (Organization.DoesNotExist, IdeaGroup.DoesNotExist):
        return JsonResponse({'error': 'Group or Organization not found'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_idea_group(request):
    data = request.data.copy()
    organization_name = data.get('organization_name', None)

    if organization_name:
        try:
            organization = Organization.objects.get(name=organization_name)
            data['organization'] = organization.pk
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        # In case of a guest user, organization is not set
        data['organization'] = None

    serializer = IdeaGroupSerializer(data=data)
    if serializer.is_valid():
        ideagroup = serializer.save()
        return Response({
            'success': True,
            'data': {
                'id': ideagroup.id,
                # Include other necessary data if needed
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

@api_view(['GET'])
def ideas_for_guest(request, id):
    try:
        group = IdeaGroup.objects.get(pk=id)
        ideas = Idea.objects.filter(group=group)

        # Serialize both group and ideas
        serialized_group = IdeaGroupSerializer(group).data
        serialized_ideas = IdeaSerializer(ideas, many=True).data

        return Response({
            'group': serialized_group,  # Data about the group
            'ideas': serialized_ideas   # Data about the ideas
        })

    except IdeaGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=404)

@permission_classes([AllowAny])
class UpdateIdeaView(APIView):
    def put(self, request, id):
        try:
            idea = Idea.objects.get(id=idea_id)
        except Idea.DoesNotExist:
            return Response({'error': 'Idea not found'}, status=status.HTTP_404_NOT_FOUND)

        increment = request.data.get("increment", 0)
        idea.likes += increment  # Adjust the likes
        idea.save()  # Save the changes

        serializer = IdeaUpdateSerializer(idea)
        return Response(serializer.data, status=status.HTTP_200_OK)
