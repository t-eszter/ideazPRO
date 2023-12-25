import os
import django

# Set the DJANGO_SETTINGS_MODULE environment variable to your project's settings module.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ideazApp.settings")

# Initialize Django
django.setup()

from frontend.models import Idea, IdeaGroup, Person

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

    # Create Persons and Ideas
    persons_and_ideas_data = [
        {
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john.doe@example.com',
            'ideas': [
                {
                    'title': 'Idea 1 for Group 1',
                    'description': 'Description for Idea 1',
                    'group': idea_groups[0]
                },
                # Add more ideas for John as needed
            ]
        },
        {
            'firstName': 'Jane',
            'lastName': 'Smith',
            'email': 'jane.smith@example.com',
            'ideas': [
                {
                    'title': 'Idea 1 for Group 2',
                    'description': 'Description for Idea 1',
                    'group': idea_groups[1]
                },
                # Add more ideas for Jane as needed
            ]
        }
    ]

    for person_info in persons_and_ideas_data:
        person = Person(**person_info)
        person.save()

        # Create and assign ideas for the person
        for idea_data in person_info['ideas']:
            idea = Idea(**idea_data)
            idea.group = idea_data['group']  # Assign the group to the idea
            idea.person = person  # Assign the person to the idea
            idea.save()

    print("Idea Groups, Persons, and Ideas created successfully!")

if __name__ == "__main__":
    main()
