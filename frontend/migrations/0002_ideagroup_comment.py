# Generated by Django 4.2.8 on 2024-02-20 08:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ideagroup',
            name='comment',
            field=models.CharField(max_length=250, null=True),
        ),
    ]