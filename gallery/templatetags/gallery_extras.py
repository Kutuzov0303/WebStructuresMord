from django import template

register = template.Library()

# Этот тег позволяет заменять один GET-параметр, сохраняя остальные
@register.simple_tag
def param_replace(request, **kwargs):
    d = request.GET.copy()
    for k, v in kwargs.items():
        d[k] = v
    return d.urlencode()