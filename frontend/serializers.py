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
        return obj.group.organization.name 

class PersonSerializer(serializers.ModelSerializer):
    ideas = IdeaSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
