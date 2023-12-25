import os
import django

# Set the DJANGO_SETTINGS_MODULE environment variable to your project's settings module.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ideazApp.settings")

# Initialize Django
django.setup()

from frontend.models import Idea, IdeaGroup

def main():
    # Create Idea Groups first
    idea_group_data = [
        {
            'name': 'Group 1',
            'description': 'Description for Group 1',
            'status': 'active'
        },
        {
            'name': 'Group 2',
            'description': 'Description for Group 2',
            'status': 'active'
        },
        {
            'name': 'Group 3',
            'description': 'Description for Group 3',
            'status': 'active'
        }
    ]

    idea_groups = []
    for group_info in idea_group_data:
        idea_group = IdeaGroup(**group_info)
        idea_group.save()
        idea_groups.append(idea_group)

    # Create Ideas for the Idea Groups
    num_ideas_per_group = 3  # Change this number as needed

    for group in idea_groups:
        for i in range(1, num_ideas_per_group + 1):
            idea_data = {
                'title': f'Idea {i} for {group.name}',
                'description': f'Description for Idea {i}',
                'group': group
            }
            idea = Idea(**idea_data)
            idea.save()

    print(f"{num_ideas_per_group} Ideas added to each Idea Group successfully!")

if __name__ == "__main__":
    main()
