from django.db import models
import uuid
from autoslug import AutoSlugField

class IdeaGroup(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(default='')
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    slug = AutoSlugField(unique=True, populate_from='name', editable=True) 

    def __str__(self):
        return self.name

class Person(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstName = models.CharField(max_length=255)
    lastName = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    regDate = models.DateTimeField(auto_now_add=True)
    profilePic = models.ImageField()

    def __str__(self):
        return self.firstName + " " + self.lastName

class Idea(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    likes = models.IntegerField(default=0)
    postedDate = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(IdeaGroup, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, related_name='ideas')

    def __str__(self):
        return self.title 

