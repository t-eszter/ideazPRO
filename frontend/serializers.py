from rest_framework import serializers
from .models import Person, IdeaGroup, Idea, Organization

class IdeaGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaGroup
        fields = '__all__'

class IdeaSerializer(serializers.ModelSerializer):
    group = serializers.PrimaryKeyRelatedField(
        queryset=IdeaGroup.objects.all()
    )

    class Meta:
        model = Idea
        fields = '__all__'


class PersonSerializer(serializers.ModelSerializer):
    ideas = IdeaSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Organization
        fields = '__all__'
