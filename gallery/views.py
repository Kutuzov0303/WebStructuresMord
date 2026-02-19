import base64
from django.core.files.base import ContentFile 
from django.shortcuts import render, redirect
from .models import Asset
from .forms import AssetForm
from django.db.models import Q # Импортируем Q-object для сложного поиска
from django.core.paginator import Paginator
from django.contrib import messages

# request - запрос клиента на сервер
def home(request):
    search_query = request.GET.get('q', '') # Получаем строку поиска из GET-запроса
    ordering = request.GET.get('ordering', 'new') #По умолчанию новые
    days = request.GET.get('days')  # фильтрация по последним нескольким дням

    assets = Asset.objects.all() # Получаем все объекты модели Asset

    if search_query:
        assets = assets.filter(title__icontains=search_query)

    # отфильтровать по дате, если указан параметр
    if days:
        try:
            days_int = int(days)
            from django.utils import timezone
            from datetime import timedelta

            assets = assets.filter(created_at__gte=timezone.now() - timedelta(days=days_int))
        except ValueError:
            # игнорируем нечисловой input
            pass

    if ordering == 'old':
        assets = assets.order_by('created_at') # Сортируем по дате создания (старые первыми)
    elif ordering == 'name':
        assets = assets.order_by('title') # Сортируем по названию (по алфавиту)
    else:
        assets = assets.order_by('-created_at') # Сортируем по дате создания (новые первыми)

    #Пагинация
    paginator = Paginator(assets, 4) # Показывать по 4 штук

    page_number = request.GET.get('page')

    page_obj = paginator.get_page(page_number)

    #Отдаём результат
    context_data = {
        'page_title': 'Главная галерея',
        'page_obj': page_obj,
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

            messages.success(request, f'Модель "{new_asset.title}" успешно загружена!') #Уведомление о загрузке

            return redirect('home')
    else:
        form = AssetForm()

    return render(request, 'gallery/upload.html', {'form': form})