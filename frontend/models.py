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

    def __str__(self):
        return self.name

# class Person(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     firstName = models.CharField(max_length=100)
#     lastName = models.CharField(max_length=100)
#     username = models.CharField(max_length=100)
#     email = models.CharField(max_length=255)
#     password = models.CharField(max_length=128)
#     regDate = models.DateTimeField(auto_now_add=True)
#     profilePic = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='profile_pics/profile_pic_anon.svg')
#     organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
#     ROLE_CHOICES = [
#         ('user', 'User'),
#         ('admin', 'Admin'),
#         ('guest', 'Guest'),
#     ]
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')

#     def __str__(self):
#         return self.username

#     def save(self, *args, **kwargs):
#         if self.organization_id is None and hasattr(self, 'organization_name'):
#             # Check if an organization with the provided name already exists
#             if Organization.objects.filter(name=self.organization_name).exists():
#                 raise ValidationError(f"Organization with name '{self.organization_name}' already exists.")
#             else:
#                 # If no organization exists with that name, create a new one
#                 organization = Organization.objects.create(name=self.organization_name)
#                 self.organization = organization
#         self.password = make_password(self.password)
#         super(Person, self).save(*args, **kwargs)

class Person(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='person')
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    regDate = models.DateTimeField(default=timezone.now)
    profilePic = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default='default_profile_pic.svg')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
        ('guest', 'Guest'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')

    def __str__(self):
        return self.user.username


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

