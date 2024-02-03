from rest_framework import serializers
from .models import Person, IdeaGroup, Idea, Organization
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password

class IdeaGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaGroup
        fields = ['id', 'name', 'description', 'status', 'slug', 'organization']
        read_only_fields = ('slug', 'organization') 

class IdeaSerializer(serializers.ModelSerializer):
    group = serializers.PrimaryKeyRelatedField(queryset=IdeaGroup.objects.all())
    organization = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = '__all__'

    def get_organization(self, obj):
        # Check if the organization is None before accessing its attributes
        if obj.group.organization is not None:
            return obj.group.organization.name
        return None  # or return a default value or empty string

class PersonSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(write_only=True, allow_blank=False, max_length=100)

    class Meta:
        model = Person
        fields = ['firstName', 'lastName', 'username', 'email', 'password', 'organization_name']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def validate_organization_name(self, value):
        # Check if the organization already exists
        if Organization.objects.filter(name=value).exists():
            raise serializers.ValidationError("An organization with this name already exists.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            organization_name = validated_data.pop('organization_name')
            # The organization's existence has already been validated
            organization = Organization.objects.create(name=organization_name)
            validated_data['password'] = make_password(validated_data.get('password'))
            person = Person.objects.create(organization=organization, **validated_data)
            return person


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class IdeaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = ['id', 'likes', 'title', 'description']