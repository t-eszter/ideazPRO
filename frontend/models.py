from django.db import models
import uuid
from autoslug import AutoSlugField

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class IdeaGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(default='')
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    slug = AutoSlugField(unique=True, populate_from='name', editable=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='ideas')

    def __str__(self):
        return self.name

class Person(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    email = models.CharField(max_length=255)
    regDate = models.DateTimeField(auto_now_add=True)
    profilePic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('guest', 'Guest'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')

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

