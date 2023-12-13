from django import forms
from .models import BotMessage, Event, Visitor, BotSettings, CustomUser
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


STATUS_CHOICES = (
        (1, 'Новый'),
        (2, 'Думает'),
        (3, 'Работаем'),
        (4, 'Отказ'),
    )

DISPATCH_CHOICES = (
        (1, 'Новые данные'),
        (2, 'Суточный отчет'),
    )


class EventForm(forms.ModelForm):

    class Meta:
        model = Event
        fields = [
            'name',
            'description',
            'date',
            'start_time',
            'finish_time',
        ]
        widgets = {
            'name': forms.TextInput(
                attrs={'type': 'text', 'placeholder': 'Название', 'class': 'admin-input'}
            ),
            'description': forms.Textarea(
                attrs={'type': 'textarea', 'placeholder': 'Описание', 'class': 'admin-input admin-input-textarea'}
            ),
            'date': forms.DateInput(
                attrs={'type': 'date', 'placeholder': 'yyyy-mm-dd (DOB)', 'class': 'admin-input'}
            ),
            'start_time': forms.TimeInput(
                attrs={'placeholder': 'Время старта - hh:mm', 'class': 'admin-input'}
            ),
            'finish_time': forms.TimeInput(
                attrs={'placeholder': 'Время финиша - hh:mm', 'class': 'admin-input'}
            )
        }
        labels = {
            'name': '',
            'description': '',
            'date': '',
            'start_time': '',
            'finish_time': '',
        }


class VisitorForm(forms.ModelForm):
    event = forms.ModelMultipleChoiceField(queryset=Event.objects.filter(status='1'), widget=forms.CheckboxSelectMultiple, label='Мероприятия')

    class Meta:
        model = Visitor
        fields = [
            'fio',
            'age',
            'city',
            'phone',
            'telegram',
            'profession',
            'experience',
            'monthly_income',
            'hourly_income',
            'want_event',
            'event',
            'status',
            'note',
        ]
        widgets = {
            'fio': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'age': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'city': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'phone': forms.TextInput(
                attrs={'type': 'text', 'placeholder': 'Телефон', 'class': 'admin-input'}
            ),
            'telegram': forms.TextInput(
                attrs={'type': 'text', 'placeholder': 'Телеграм', 'class': 'admin-input'}
            ),
            'profession': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'experience': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'monthly_income': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'hourly_income': forms.TextInput(
                attrs={'type': 'text', 'readonly': 'true', 'class': 'admin-input'}
            ),
            'want_event': forms.Select(
                attrs={'class': 'admin-input'}
            ),
            'status': forms.Select(
                choices=STATUS_CHOICES,
                attrs={'class': 'admin-input'}
            ),
            'note': forms.Textarea(
                attrs={'type': 'textarea', 'placeholder': 'Примечание', 'class': 'admin-input admin-input-textarea'}
            ),
        }
        labels = {
            'fio': 'ФИО',
            'age': 'Возраст',
            'city': 'Город',
            'phone': 'Телефон',
            'telegram': 'Телеграм',
            'profession': 'Профессия',
            'experience': 'Стаж',
            'monthly_income': 'ЗП в месяц',
            'hourly_income': 'ЗП в час',
            'want_event': 'Участие в мероприятиях',
            'status': 'Статус',
            'note': 'Примечание',
        }


class BotSettingsForm(forms.ModelForm):

    class Meta:
        model = BotSettings
        fields = [
            'start_text',
            'stiker_text',
            'subscribe_text',
            'remind_text',
            'link_text',
            'rate_text',
            'review_text',
            'bot_link'
        ]
        widgets = {
            'start_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'stiker_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'subscribe_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'remind_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'link_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'rate_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'review_text': forms.Textarea(
                attrs={'type': 'textarea', 'class': 'admin-input admin-input-textarea'}
            ),
            'bot_link': forms.TextInput(
                attrs={'type': 'text', 'class': 'admin-input'}
            ),
        }
        labels = {
            'start_text': 'Текст приветствия',
            'stiker_text': 'Текст и ссылка со стикерами',
            'subscribe_text': 'Текст после установки мероприятий',
            'remind_text': 'Текст напоминания',
            'link_text': 'Текст со ссылкой на мероприятие',
            'rate_text': 'Текст с запросом оценки',
            'review_text': 'Текст с просьбой поделиться впечатлением',
            'bot_link': 'Ссылка на телеграм-бот',
        }


class BotMessageForm(forms.ModelForm):
    recipient = forms.ModelChoiceField(
        queryset=Event.objects.exclude(status='3'),
        label='',
        empty_label='Всем',
        widget=forms.Select(attrs={'class': 'edit-select', 'style': 'margin-left: 0px;'}))

    class Meta:
        model = BotMessage
        fields = [
            'text',
            'recipient',
        ]
        widgets = {
            'text': forms.Textarea(
                attrs={
                    'type': 'textarea',
                    'placeholder': 'Текст сообщения',
                    'class': 'admin-input edit-input',
                    'style': 'height:100px; margin-bottom: 20px;'
                },
            ),
        }
        labels = {
            'text': '',
        }


class CustomUserForm(UserCreationForm):

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super(CustomUserForm, self).__init__(*args, **kwargs)

        self.fields['username'].widget.attrs['class'] = 'admin-input edit-input'
        self.fields['username'].widget.attrs['style'] = 'margin-bottom: 20px;'
        self.fields['username'].widget.attrs['placeholder'] = 'Имя пользователя'
        self.fields['username'].label = ''
        self.fields['username'].help_text = '<span style="font-size:14px">Максимум 20 символов</span>'

        self.fields['password1'].widget.attrs['class'] = 'admin-input edit-input'
        self.fields['username'].widget.attrs['style'] = 'margin-bottom: 20px;'
        self.fields['password1'].widget.attrs['placeholder'] = 'Пароль'
        self.fields['password1'].label = ''
        self.fields['password1'].help_text = '<span style="font-size:14px">Минимальная длина 8 символов. Пароль не должен состоять только из цифр</span>'

        self.fields['password2'].widget.attrs['class'] = 'admin-input edit-input'
        self.fields['password2'].widget.attrs['placeholder'] = 'Повторите пароль'
        self.fields['password2'].label = ''
        self.fields['password2'].help_text = '<span style="font-size:14px">Повторите пароль для проверки</span>'


class CustomUserEditForm(forms.ModelForm):

    class Meta:
        model = CustomUser
        fields = [
            'telegram',
            'report',
        ]
        widgets = {
            'telegram': forms.TextInput(
                attrs={'type': 'text', 'placeholder': 'Telegram ник', 'class': 'admin-input edit-input', 'style': 'margin-bottom: 20px;'}
            ),
            'report': forms.Select(
                choices=DISPATCH_CHOICES,
                attrs={'class': 'admin-input edit-select',  'style': 'margin-left: 0px;'}
            ),
        }
        labels = {
            'telegram': '',
            'report': '',
        }
