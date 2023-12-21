from django.db import models
import uuid

class IdeaGroup(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(default='')
    status = models.CharField(max_length=255, default='active')

    def __str__(self):
        return self.name

class Idea(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    postedDate = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(IdeaGroup, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Person(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstName = models.CharField(max_length=255)
    lastName = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    regDate = models.DateTimeField(auto_now_add=True)
    ideas = models.ForeignKey('Idea', on_delete=models.CASCADE, related_name='persons')

    def __str__(self):
        return self.name

