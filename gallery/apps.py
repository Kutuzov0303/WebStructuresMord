from django.apps import AppConfig


class GalleryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gallery'

    def ready(self):
        # При старте приложения импортируем обработчики сигналов,
        # чтобы post_delete выполнялся и удалял файлы с диска.
        import gallery.signals