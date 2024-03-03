from django.db import models
import uuid
from autoslug import AutoSlugField
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


def get_default_organization():
    return Organization.objects.get_or_create(name="TEMPORARY")[0]

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)

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
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='ideagroups',
        default=None
    )
    comment = models.CharField(max_length=250, null=True)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Person(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='person')
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    regDate = models.DateTimeField(default=timezone.now)
    profilePic = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='profile_pic_anon.svg')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('guest', 'Guest'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')

    def __str__(self):
        return f"{self.user.username} Profile"


class Idea(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    postedDate = models.DateTimeField(auto_now_add=True)
    group = models.ForeignKey(IdeaGroup, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, related_name='ideas')

    def __str__(self):
        return self.title 

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=10, choices=[('upvote', 'Upvote'), ('downvote', 'Downvote')])

    class Meta:
        unique_together = ('user', 'idea')

    def __str__(self):
        return f"{self.user.username} - {self.vote_type} - Idea {self.idea.id}"

