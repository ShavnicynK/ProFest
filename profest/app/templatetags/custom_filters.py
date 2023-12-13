from django import template


register = template.Library()


@register.filter()
def empty_data(value):
    if value == 0 or value == '':
        value = '--'
    return value


@register.filter()
def w_event(value):
    if value == 'Y':
        value = 'Хочет участвовать'
    else:
        value = 'Не заинтересовало'
    return value


@register.filter()
def d_type(value):
    if value == 'D':
        value = 'Компьютер'
    else:
        value = 'Телефон/Планшет'
    return value


@register.filter()
def status(value):
    if value == 1:
        value = 'Новый'
    elif value == 2:
        value = 'Думает'
    elif value == 3:
        value = 'Работаем'
    elif value == 4:
        value = 'Отказ'
    return value


@register.filter()
def r_type(value):
    if value == 1:
        value = 'Новые данные'
    elif value == 2:
        value = 'Суточный отчет'
    else:
        value = 'Не подключены'
    return value
