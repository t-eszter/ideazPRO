from rest_framework import generics
from .models import IdeaGroup
from .serializers import IdeaGroupSerializer

class IdeaGroupList(generics.ListAPIView):
    queryset = IdeaGroup.objects.all()
    serializer_class = IdeaGroupSerializer
