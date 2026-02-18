import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Asset

@receiver(post_delete, sender=Asset)

def remove_file_on_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)
            print(f"Файл {instance.file.path} удалён c диска.")

    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)
            print(f"Превью {instance.image.path} удалено c диска.")