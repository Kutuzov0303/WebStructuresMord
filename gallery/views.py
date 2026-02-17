from django.shortcuts import render
from django.http import HttpResponse
# request - запрос клиента на сервер
def home(request):
    fake_database = [
        {'id': 1, 'name': 'Sci-Fi Helmet', 'file_size': '15 MB'},
        {'id': 2, 'name': 'Old Chair', 'file_size': '2 MB'},
        {'id': 3, 'name': 'Cyber Truck', 'file_size': '10 MB'},
        {'id': 4, 'name': 'Fantasy Home', 'file_size': '30 MB'},
]
    context_data = {
        'page_title': 'Главная страница',
        'assets' : fake_database,
    }

    return render(request, 'gallery/index.html', context_data)

def about(request):
    return HttpResponse("<p>Курс Web-стуруктуры.</p>")