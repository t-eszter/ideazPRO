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

    # Create Persons
    person_data = [
        {
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john.doe@example.com'
        },
        {
            'firstName': 'Jane',
            'lastName': 'Smith',
            'email': 'jane.smith@example.com'
        }
    ]

    persons = []
    for person_info in person_data:
        person = Person(**person_info)
        person.save()
        persons.append(person)

    # Loop through each IdeaGroup and add 4 ideas to each
    for idea_group in idea_groups:
        for i in range(1, 5):  # Add 4 ideas
            idea_data = {
                'title': f'Idea {i} for {idea_group.name}',
                'description': f'Description for Idea {i}',
                'group': idea_group,
                'person': persons[i % len(persons)]  # Assign a person to the idea
            }

            idea = Idea(**idea_data)
            idea.save()

    print("Idea Groups, Persons, and Ideas created successfully!")

if __name__ == "__main__":
    main()
