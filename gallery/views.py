import base64
from django.core.files.base import ContentFile 
from django.shortcuts import render, redirect
from .models import Asset
from .forms import AssetForm
# request - запрос клиента на сервер
def home(request):
    # ORM Запрос:
    assets = Asset.objects.all().order_by('-created_at')
    context_data = {
        'page_title': 'Главная Галерея',
        'assets': assets,
}
    return render(request, 'gallery/index.html', context_data)

def about(request):
    return render(request, 'gallery/about.html')

def upload(request):
    if request.method == 'POST':
        form = AssetForm(request.POST, request.FILES)
        if form.is_valid():
            new_asset = form.save(commit=False) #Объект создан, но не сохранён

            image_data = request.POST.get('image_data') #Получаем строку base64

            if image_data:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1] # получаем "jpeg"

                data = base64.b64decode(imgstr)

                file_name = f"{new_asset.title}_thumb.{ext}"

                new_asset.image.save(file_name, ContentFile(data), save=False)

            # Сохраняем объект в базе данных
            new_asset.save()

            return redirect('home')
    else:
        form = AssetForm()

    return render(request, 'gallery/upload.html', {'form': form})