from django_filters import FilterSet, ModelChoiceFilter, ChoiceFilter, CharFilter, RangeFilter, BooleanFilter
from django_filters.widgets import forms
from .models import Visitor, EventRating


STATUS_CHOICES = (
        (1, 'Новый'),
        (2, 'Думает'),
        (3, 'Работаем'),
        (4, 'Отказ'),
    )


RATE_CHOICES = (
        (5, '5'),
        (4, '4'),
        (3, '3'),
        (2, '2'),
        (1, '1'),
    )


class VisitorFilter(FilterSet):
    city = CharFilter(
        field_name='city',
        label='Город',
        lookup_expr='icontains',
    )

    status = ChoiceFilter(
        choices=STATUS_CHOICES,
        empty_label='Все',
        label='Статус',
    )

    age = RangeFilter(
        field_name='age',
        lookup_expr='range',
        label='Возраст',
    )

    telegram_user_id = BooleanFilter(
        field_name='telegram_user_id',
        exclude=True,
        lookup_expr='isnull',
        label='Есть в боте',
    )

    class Meta:
        model = Visitor
        fields = ['status', 'city', 'age', 'telegram_user_id']


class EventRatingFilter(FilterSet):
    rate = ChoiceFilter(
        choices=RATE_CHOICES,
        label='Оценки'
    )

    class Meta:
        model = EventRating
        fields = ['rate']
