# Generated by Django 4.2.8 on 2024-03-17 20:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0004_alter_comment_unique_together'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='idea',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='ideas', to='frontend.tag'),
        ),
    ]
