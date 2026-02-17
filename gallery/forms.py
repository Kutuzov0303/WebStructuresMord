from django import forms
from .models import Asset
from django.core.exceptions import ValidationError
import os

class AssetForm(forms.ModelForm):
    class Meta:
        model = Asset
        fields = ['title', 'file']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Название модели'}),
        }
    def clean_file(self):
        file = self.cleaned_data.get('file')
        ext = os.path.splitext(file.name)[1].lower()

        valid_extensions = ['.glb', '.gltf']

        if ext not in valid_extensions:
            raise ValidationError('Неподдерживаемый формат файла. Разрешены только .glb и .gltf')
        return file