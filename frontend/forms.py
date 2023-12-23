from django import forms
from .models import IdeaGroup

class IdeaGroupForm(forms.ModelForm):
    class Meta:
        model = IdeaGroup
        fields = ['name', 'description', 'status', 'slug']
