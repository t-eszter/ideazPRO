import json
import os
import subprocess

from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from uuid import UUID
from django.conf import settings
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db import transaction
from django.views.decorators.http import require_http_methods


from .models import IdeaGroup, Idea, Person, Organization
from .serializers import IdeaGroupSerializer, IdeaSerializer, IdeaUpdateSerializer, PersonSerializer


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
# class GroupDetailView(RetrieveAPIView):
#     serializer_class = IdeaGroupSerializer
#     lookup_field = 'slug'

#     def get_queryset(self):
#         organization_name = self.kwargs.get('organization_name')
#         return IdeaGroup.objects.filter(organization__name=organization_name)

class GroupDetailView(APIView):
    serializer_class = IdeaGroupSerializer
    lookup_field = 'slug'

    def get(self, request, groupId, format=None):
        ideagroup = get_object_or_404(IdeaGroup, id=groupId)
        serializer = IdeaGroupSerializer(ideagroup)
        return Response(serializer.data)


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
    def put(self, request, idea_id):
        try:
            # Convert idea_id to UUID
            uuid_idea_id = UUID(idea_id)

            # Retrieve the idea
            idea = Idea.objects.get(id=uuid_idea_id)

            # Update likes if 'increment' is provided
            increment = request.data.get("increment")
            if increment is not None:
                idea.likes += int(increment)
                idea.save()

            # Check if an organization_id is provided to update the IdeaGroup
            organization_id = request.data.get("organization_id")
            if organization_id:
                # Convert organization_id to UUID and retrieve the organization
                uuid_organization_id = UUID(organization_id)
                organization = Organization.objects.get(id=uuid_organization_id)

                # Get the IdeaGroup associated with the idea and update its organization
                idea_group = idea.idea_group
                idea_group.organization = organization
                idea_group.save()

            # Serialize and return the updated idea
            serializer = IdeaUpdateSerializer(idea)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Idea.DoesNotExist:
            return Response({'error': 'Idea not found'}, status=status.HTTP_404_NOT_FOUND)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, TypeError, AttributeError) as e:
            return Response({'error': 'Invalid input data: {}'.format(str(e))}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        with transaction.atomic():
            # Extract necessary data from request
            user_data = request.data.get('user')
            organization_name = request.data.get('organization_name', None)
            organization_id = request.data.get('organization_id', None)
            idea_group_id = request.data.get('idea_group_id')
            
            # Validate and create user
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password']
            )

            # Handle organization logic
            if organization_name:
                # User wants to create a new organization and be its admin
                organization, created = Organization.objects.get_or_create(name=organization_name)
                role = 'admin'
            elif organization_id:
                # User wants to join an existing organization as a user
                organization = get_object_or_404(Organization, pk=organization_id)
                role = 'user'

            # Create the Person instance
            person = Person.objects.create(
                user=user,
                firstName=request.data.get('firstName'),
                lastName=request.data.get('lastName'),
                organization=organization,
                role=role
            )

            # If joining an existing organization, no need to update the IdeaGroup's organization
            # If creating a new organization, and the idea_group_id is provided,
            # only then associate the IdeaGroup with the new organization
            if organization and not organization_id and idea_group_id:
                idea_group = get_object_or_404(IdeaGroup, pk=idea_group_id)
                idea_group.organization = organization
                idea_group.save()

            return Response({
                "message": "User registered successfully",
                "userId": user.id,
                "personId": person.id,
                "organizationId": organization.id if organization else None,
                "role": role
            })

# @csrf_exempt  # Use this decorator cautiously and only if necessary
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data['username']
        password = data['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            try:
                person = Person.objects.get(user=user)
                # Determine the organization name and ID, default to 'guest' and None if not associated with any
                organization_name = person.organization.name if person.organization else 'guest'
                organization_id = str(person.organization.id) if person.organization else None

                print(f"Organization Name: {organization_name}, Organization ID: {organization_id}")

                token, _ = Token.objects.get_or_create(user=user)

                return JsonResponse({
                    'key': token.key,
                    'organizationName': organization_name,
                    'organizationId': organization_id,  # Include organization ID in the response
                    'userName': user.username,
                })
            except Person.DoesNotExist:
                # This branch should theoretically never be reached since users without a Person profile cannot login
                return JsonResponse({'error': 'Person profile does not exist.'}, status=400)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)


def organization_members(request, organization_id):
    try:
        # Retrieve the organization by its ID
        organization = get_object_or_404(Organization, id=organization_id)

        # Retrieve all Person instances related to the organization
        members = organization.members.all().select_related('user')

        for person in Person.objects.all():
            print(person.firstName, person.organization)

        # Create a list to hold member data
        members_data = []
        for member in members:
            members_data.append({
                "id": str(member.id),
                "username": member.user.username,
                "email": member.user.email,
                "firstName": member.firstName,
                "lastName": member.lastName,
                "regDate": member.regDate.strftime('%Y-%m-%d %H:%M:%S'),  # Format datetime
                "role": member.role,
                "profilePic": request.build_absolute_uri(member.profilePic.url) if member.profilePic else None,
            })

        # Return a JsonResponse
        return JsonResponse({"organization": organization.name, "members": members_data})
    except ObjectDoesNotExist:
        return JsonResponse({"error": "The requested organization does not exist."}, status=404)


@require_http_methods(["POST"])
def update_person_details(request, user_id):
    try:
        # Assuming the frontend sends the data as a JSON payload
        data = json.loads(request.body)

        # Fetch the Person instance associated with the user_id
        person = Person.objects.get(user_id=user_id)

        # Update the fields
        person.firstName = data.get('firstName', person.firstName)
        person.lastName = data.get('lastName', person.lastName)
        person.role = data.get('role', person.role)

        # Handle profile picture update if provided
        if 'profilePic' in request.FILES:
            profile_pic_file = request.FILES['profilePic']
            save_path = default_storage.save(f"profile_pics/{profile_pic_file.name}", profile_pic_file)
            person.profilePic = save_path

        person.save()

        return JsonResponse({"status": "success", "message": "Person details updated successfully."}, status=200)
    except Person.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Person not found."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
