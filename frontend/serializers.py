from rest_framework import serializers
from .models import Person, IdeaGroup, Idea, Organization, Comment
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

class IdeaGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaGroup
        fields = ['id', 'name', 'description', 'status', 'slug', 'organization', 'comment', 'created', 'last_updated']
        read_only_fields = ('slug', 'organization', 'created', 'last_updated')

        def perform_create(self, serializer):
            user_organization = self.request.user.organization
            serializer.save(organization=user_organization)
        

class IdeaSerializer(serializers.ModelSerializer):
    group = serializers.PrimaryKeyRelatedField(queryset=IdeaGroup.objects.all())
    organization = serializers.SerializerMethodField()
    posted_by = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = '__all__'

    def get_organization(self, obj):
        if obj.group.organization is not None:
            return obj.group.organization.name
        return None 

    def get_posted_by(self, obj):
        # Assuming 'person' field in Idea model and 'user' field in Person model
        if obj.person and obj.person.user:
            return obj.person.user.username
        return "Anonymous"

# class PersonSerializer(serializers.ModelSerializer):
#     organization_name = serializers.CharField(write_only=True, allow_blank=False, max_length=100)
#     idea_group_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

#     class Meta:
#         model = Person
#         fields = ['firstName', 'lastName', 'username', 'email', 'password', 'organization_name', 'idea_group_id']
#         extra_kwargs = {'password': {'write_only': True, 'required': True}}

#     def validate_organization_name(self, value):
#         if Organization.objects.filter(name=value).exists():
#             raise serializers.ValidationError("An organization with this name already exists.")
#         return value

#     def create(self, validated_data):
#         organization_name = validated_data.pop('organization_name')
#         idea_group_id = validated_data.pop('idea_group_id', None)

#         with transaction.atomic():
#             organization, created = Organization.objects.get_or_create(name=organization_name)
#             validated_data['password'] = make_password(validated_data.get('password'))
            
#             if created:
#                 validated_data['role'] = 'admin'
            
#             person = Person.objects.create(organization=organization, **validated_data)
            
#             if idea_group_id:
#                 try:
#                     idea_group = IdeaGroup.objects.get(id=idea_group_id)
#                     print(f"Found IdeaGroup: {idea_group.name}")  # Debugging statement
#                     idea_group.organization = organization
#                     idea_group.save()
#                 except IdeaGroup.DoesNotExist:
#                     print(f"IdeaGroup with id {idea_group_id} does not exist.")
#                     pass
            
#             return person

class UserSerializer(serializers.ModelSerializer):
    profilePic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'profilePic']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)

    def get_profilePic(self, user):
            person = getattr(user, 'person', None)
            if person:
                print("Profile Pic URL:", person.profilePic if person else "No profile pic")
                return person.profilePic
            return None 


class PersonSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    organization_name = serializers.CharField(write_only=True, allow_blank=True, required=False, max_length=100)
    organization_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Person
        fields = ['id', 'user', 'firstName', 'lastName', 'profilePic', 'organization', 'role', 'organization_name', 'organization_id', 'profilePic']
        read_only_fields = ['id']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = UserSerializer.create(UserSerializer(), validated_data=user_data)

        organization_id = validated_data.pop('organization_id', None)
        organization_name = validated_data.pop('organization_name', None)
        
        if organization_id:
            organization = Organization.objects.get(id=organization_id)
        elif organization_name:
            organization, _ = Organization.objects.get_or_create(name=organization_name)
        else:
            organization = None  # Or handle as needed
            

        validated_data['user'] = user
        validated_data['organization'] = organization

        person = Person.objects.create(**validated_data)
        return person

    def update(self, instance, validated_data):
        # Custom update logic if necessary
        pass



class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class IdeaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = ['id', 'likes', 'title', 'description']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # This now includes profilePic via the UserSerializer

    class Meta:
        model = Comment
        fields = ['id', 'comment', 'idea', 'user', 'commentTime']  # No need for a separate 'person' field
        read_only_fields = ('id', 'user', 'commentTime')


    def create(self, validated_data):
        # Assuming the request user is set automatically from the view
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)