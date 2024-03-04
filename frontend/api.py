import json
import os
import subprocess
import uuid

from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, get_user_model
from django.views.decorators.csrf import csrf_exempt
from uuid import UUID
from django.conf import settings
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db import transaction
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.contrib.auth import password_validation, update_session_auth_hash
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Case, When, IntegerField, Q
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET
from django.http import HttpResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from .models import *
from .serializers import *

User = get_user_model()

@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    return HttpResponse("CSRF cookie set")


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


class IdeaGroupCreateView(CreateAPIView):
    queryset = IdeaGroup.objects.all()
    serializer_class = IdeaGroupSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Retrieve the Person instance associated with the authenticated user
        person = get_object_or_404(Person, user=self.request.user)
        # Use the organization from the Person instance to set the organization foreign key
        serializer.save(organization=person.organization)


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


@require_POST
def create_idea(request):
    try:
        data = json.loads(request.body)
        person_id = data.get('person', None)
        person = get_object_or_404(Person, id=person_id) if person_id else None
        group = get_object_or_404(IdeaGroup, pk=data['group'])

        idea = Idea.objects.create(
            title=data['title'],
            description=data['description'],
            group=group,
            person=person
        )
        return JsonResponse({'message': 'Idea created successfully', 'id': idea.id}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


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
            # uuid_idea_id = UUID(idea_id)

            # Retrieve the idea
            idea = Idea.objects.get(id=idea_id)

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
        with transaction.atomic():  # Ensure atomicity of the user creation and organization linking
            try:
                data = request.data

                # Create the User
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    password=data['password']
                )

                # Prepare person_data
                person_data = {
                    'firstName': data.get('firstName'),
                    'lastName': data.get('lastName'),
                    'role': 'guest',  # Default role
                }

                # Handle organization logic
                if 'organizationId' in data and data['organizationId']:
                    organization = Organization.objects.get(id=data['organizationId'])
                    person_data['organization'] = organization
                    person_data['role'] = 'user'
                else:
                    organization_name = data.get('organization_name', 'Default Organization Name')
                    organization = Organization.objects.create(name=organization_name)
                    person_data['organization'] = organization
                    person_data['role'] = 'admin'

                # Create the Person
                person = Person.objects.create(user=user, **person_data)

                # If there's an IdeaGroup ID, update its organization field
                idea_group_id = data.get('idea_group_id')
                if idea_group_id:
                    idea_group = get_object_or_404(IdeaGroup, id=uuid.UUID(idea_group_id))
                    idea_group.organization = organization
                    idea_group.save()

                # Create or get a token for the created user
                token, created = Token.objects.get_or_create(user=user)

                # Automatically log the user in after registration
                login(request, user)

                return JsonResponse({
                    'status': 'success',
                    'userId': user.id,
                    'personId': person.id,
                    'organizationId': organization.id,
                    'token': token.key,
                    'message': 'User, Person, and Organization created successfully.'
                })

            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)




# @csrf_exempt  # Use this decorator cautiously and only if necessary
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            try:
                # Assuming a one-to-one relationship between User and Person
                person = Person.objects.get(user=user)
                organization_name = 'guest'
                organization_id = None
                if person.organization:
                    organization_name = person.organization.name
                    organization_id = str(person.organization.id)
                
                if person.profilePic:
                    profile_pic_url = person.profilePic
                else:
                    # Handle the default profile picture as a static file
                    # Adjust the path as necessary based on where you store your static files
                    profile_pic_url = request.build_absolute_uri(settings.STATIC_URL + 'images/profile_pics/profile_pic_anon.svg')

                print("Profile Pic URL:", profile_pic_url)

                token, _ = Token.objects.get_or_create(user=user)

                return JsonResponse({
                    'key': token.key,
                    'organizationName': organization_name,
                    'organizationId': organization_id,
                    'userName': user.username,
                    'userId': user.id,  # Use Django User model's ID
                    'firstName': person.firstName,
                    'lastName': person.lastName,
                    'email': user.email,
                    'personid': person.id,
                    'profilePic': profile_pic_url,
                })
            except Person.DoesNotExist:
                return JsonResponse({'error': 'Person profile does not exist.'}, status=400)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)


def organization_members(request, organization_id):
    try:
        # Retrieve the organization by its ID
        organization = get_object_or_404(Organization, id=organization_id)

        # Retrieve all Person instances related to the organization
        members = organization.members.all().select_related('user')

        # for person in Person.objects.all():
        #     print(person.firstName, person.organization)

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
                "profilePic": member.profilePic if member.profilePic else None,
            })

        # Return a JsonResponse
        return JsonResponse({"organization": organization.name, "members": members_data})
    except ObjectDoesNotExist:
        return JsonResponse({"error": "The requested organization does not exist."}, status=404)

def fetch_person_details(request, username):
    if request.method == "GET":
        # Retrieve the User object based on the username
        user = get_object_or_404(User, username=username)
        
        # Retrieve the associated Person object
        person = get_object_or_404(Person, user=user)
        
        # Construct the data to return
        person_data = {
            "username": user.username,
            "firstName": person.firstName,
            "email": user.email,
            "lastName": person.lastName,
            "regDate": person.regDate.strftime('%Y-%m-%d %H:%M:%S'),
            "role": person.role,
            "profilePic": person.profilePic if person.profilePic else None,
            "organizationName": person.organization.name if person.organization else "No Organization",
            "organizationId": str(person.organization.id) if person.organization else None,
        }
        
        # Return a JsonResponse
        return JsonResponse(person_data)
    else:
        # Method Not Allowed
        return JsonResponse({"error": "GET request required."}, status=405)


# User setiings
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not user.check_password(old_password):
        return JsonResponse({'error': 'Wrong password.'}, status=400)

    try:
        # Validate the new password
        password_validation.validate_password(new_password, user)
        # Set the new password
        user.set_password(new_password)
        user.save()
        # Important: Update the session with the new password
        update_session_auth_hash(request, user)
        return JsonResponse({'success': 'Password updated successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_email(request):
    user = request.user
    new_email = request.data.get('new_email')
    print("Email to update:", new_email)
    print("Request body:", request.data)

    # Optional: Add additional checks, e.g., format validation or uniqueness check
    user.email = new_email
    user.save()
    return JsonResponse({'success': 'Email updated successfully.'})

def update_person_details(request, user_id):
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
        person = user.person  # Assuming you have 'related_name="person"' in your Person model

        # Update User model fields
        user.email = request.POST.get('email', user.email)
        if 'password' in request.POST:
            user.set_password(request.POST['password'])
        user.save()

        # Update Person model fields
        person.firstName = request.POST.get('firstName', person.firstName)
        person.lastName = request.POST.get('lastName', person.lastName)

        # Handle profile picture URL update if provided
        profile_pic_url = request.POST.get('profilePicUrl')  # Get the profile picture URL from the request
        if profile_pic_url:
            person.profilePic = profile_pic_url  # Assuming 'profilePic' field in Person model is a CharField to store the URL

        person.save()

        response_data = {
            "status": "success",
            "message": "User and Person details updated successfully.",
            "profilePicUrl": person.profilePic  # Include the profilePicUrl in the response
        }

        return JsonResponse(response_data)
    except User.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


        

# from django.core.mail import send_mail
# from django.utils.http import urlsafe_base64_encode
# from django.utils.encoding import force_bytes

# def send_invite(request, organization_id):
#     if request.method == "POST":
#         # Assuming the request body is JSON
#         import json
#         body_unicode = request.body.decode('utf-8')
#         body = json.loads(body_unicode)
#         email = body['email']

#         # Generate your invitation link here. This might involve creating
#         # an invite token or simply crafting a URL with the organization ID.
#         # This example will use a simple URL.
#         invite_link = f"https://ideaz.pro/invite?org={organization_id}"

#         # Sending the email
#         send_mail(
#             'You are invited to join our organization',
#             f'Please use the following link to join our organization: {invite_link}',
#             'invite@zuerichadresse.ch',
#             [email],
#             fail_silently=False,
#         )

#         return JsonResponse({'status': 'Invitation sent successfully.'}, status=200)
#     else:
#         return JsonResponse({'error': 'Invalid request'}, status=400)


class IdeaGroupUpdateView(RetrieveUpdateAPIView):
    queryset = IdeaGroup.objects.all()
    serializer_class = IdeaGroupSerializer
    permission_classes = [IsAuthenticated]  # Customize as needed

    def perform_update(self, serializer):
        # Optional: Add any custom update logic here
        serializer.save()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def handle_vote(request, idea_id):
    if request.method == 'POST':
        user = request.user
        vote_type = request.data.get('voteType')

        # Find existing vote by the user for the idea
        vote, created = Vote.objects.get_or_create(user=user, idea_id=idea_id, defaults={'vote_type': vote_type})

        if not created and vote.vote_type != vote_type:
            # If vote exists but the type is different, update it
            vote.vote_type = vote_type
            vote.save()
        elif not created and vote.vote_type == vote_type:
            # If vote exists and the type is the same, remove the vote
            vote.delete()

    # Fetch the total votes for the idea
    idea_votes = Idea.objects.annotate(
        upvotes=Count('votes', filter=Q(votes__vote_type='upvote')),
        downvotes=Count('votes', filter=Q(votes__vote_type='downvote')),
    ).get(pk=idea_id)
    
    total_votes = idea_votes.upvotes - idea_votes.downvotes

    # Check the current user's vote
    user_vote = None
    if request.user.is_authenticated:
        user_vote_qs = Vote.objects.filter(user=request.user, idea_id=idea_id)
        if user_vote_qs.exists():
            user_vote = user_vote_qs.first().vote_type

    # Return the vote counts and the current user's vote
    return Response({
        'total_votes': total_votes,
        'user_vote': user_vote
    })


from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_invite(request, organization_id):
    print('hello')
    if request.method == "POST":
        print('hello')
        try:
            data = json.loads(request.body)
            to_email = data.get('email')
            subject = "You're Invited!"
            content = data.get('emailContent')
            
            # Simplified function to send email
            message = Mail(
                from_email='invite@ideaz.pro',
                to_emails=to_email,
                subject=subject,
                html_content=content
            )
            sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
            response = sg.send(message)
            # logger.info(response.status_code, response.body, response.headers)
            
            return JsonResponse({"message": "Invitation sent successfully."}, status=200)

        except Exception as e:
            # logger.error(f"Error sending invite: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

class RegisterFromInvite(APIView):
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.get(pk=organization_id)
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)


@require_POST
def update_member_role(request, member_id):
    try:
        data = json.loads(request.body)
        new_role = data.get('role')
        member = Person.objects.get(pk=member_id)
        member.role = new_role
        member.save()
        return JsonResponse({'status': 'success', 'message': 'Role updated successfully'})
    except Person.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Member not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


class CommentsList(APIView):
    def get(self, request, idea_id, *args, **kwargs):
        comments = Comment.objects.filter(idea_id=idea_id).select_related('user', 'user__person').all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)