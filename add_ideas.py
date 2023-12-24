from frontend.models import Idea, IdeaGroup

def main():
    # Retrieve all IdeaGroup instances
    idea_groups = IdeaGroup.objects.all()

    # Loop through each IdeaGroup and add 4 ideas to each
    for idea_group in idea_groups:
        for i in range(1, 5):  # Add 4 ideas
            idea_data = {
                'title': f'Idea {i} for {idea_group.name}',
                'description': f'Description for Idea {i}',
                'group': idea_group,
            }

            idea = Idea(**idea_data)
            idea.save()

    print("Ideas created successfully!")

if __name__ == "__main__":
    main()
