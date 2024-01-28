from rest_framework import serializers
from .models import Person, IdeaGroup, Idea, Organization

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
    ideas = IdeaSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
