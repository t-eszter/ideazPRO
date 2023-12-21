from rest_framework import serializers
from .models import Person, IdeaGroup, Idea

class IdeaGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaGroup
        fields = '__all__'

class IdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = '__all__'

class PersonSerializer(serializers.ModelSerializer):
    ideas = IdeaSerializer(many=True, read_only=True)

    class Meta:
        model = Person
        fields = '__all__'
