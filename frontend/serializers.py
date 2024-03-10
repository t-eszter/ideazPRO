from rest_framework import serializers
from .models import Person, IdeaGroup, Idea, Organization, Comment
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

class IdeaGroupSerializer(serializers.ModelSerializer):
    organization_details = serializers.SerializerMethodField()

    class Meta:
        model = IdeaGroup
        fields = ['id', 'name', 'description', 'status', 'slug', 'organization_details', 'comment', 'created', 'last_updated']
        read_only_fields = ('slug', 'created', 'last_updated')

    def get_organization_details(self, obj):
        if obj.organization:
            return {"id": obj.organization.id, "name": obj.organization.name}
        return None

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
        if obj.person and obj.person.user:
            return obj.person.user.username
        return "Anonymous"
#

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
            organization = None  
            

        validated_data['user'] = user
        validated_data['organization'] = organization

        person = Person.objects.create(**validated_data)
        return person

    def update(self, instance, validated_data):
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
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'comment', 'idea', 'user', 'commentTime'] 
        read_only_fields = ('id', 'user', 'commentTime')


    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)