# Generated by Django 4.2.8 on 2024-02-20 11:21

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0002_ideagroup_comment'),
    ]

    operations = [
        migrations.AddField(
            model_name='ideagroup',
            name='created',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ideagroup',
            name='last_updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]