import json
from datetime import datetime
from django.views.generic import ListView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.db.models import Sum, Avg, Q, F
from .models import Visitor, Event, BotMessage, EventRating, BotSettings, Attendance, CustomUser
from .form import BotMessageForm, EventForm, VisitorForm, BotSettingsForm, CustomUserForm, CustomUserEditForm
from .filters import VisitorFilter, EventRatingFilter
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.conf import settings
import telebot
from telebot import types
bot = telebot.TeleBot(settings.TELEBOT_TOKEN)


def index_view(request):
    date = datetime.today()
    obj, created = Attendance.objects.update_or_create(date=date)
    obj.count = F('count') + 1
    obj.save()

    events = Event.objects.filter(status='1')[:5]
    five_events = False
    for i, event in enumerate(events):
        if i == 0:
            event.style = 'fest-program__card_square fest-program__card_black'
            event.num = 1
        elif i == 1:
            event.style = 'fest-program__card_square fest-program__card_violet'
            event.num = 2
        elif i == 2:
            if events.count() == 5:
                event.style = ''
                event.num = 3
                five_events = True
            else:
                event.style = 'fest-program__card_square fest-program__card_green'
                event.num = 4
        elif i == 3:
            if events.count() == 5:
                event.style = 'fest-program__card_square fest-program__card_green'
                event.num = 4
            else:
                event.style = 'fest-program__card_square fest-program__card_black'
                event.num = 5
        elif i == 4:
            event.style = 'fest-program__card_square fest-program__card_black'
            event.num = 5

    start_fest = Event.objects.filter(status='1').order_by('date').values('date').first()['date']
    end_fest = Event.objects.filter(status='1').order_by('-date').values('date').first()['date']

    data = {
        'events': events,
        'five_events': five_events,
        'start_fest': start_fest,
        'end_fest': end_fest,
    }
    return render(request, 'main_page.html', {'data': data})


@login_required
def manage_page(request):
    events = Event.objects.filter(status='1')
    visits = Attendance.objects.aggregate(Sum('count'))['count__sum']
    fio = Visitor.objects.exclude(fio='').count()
    age = Visitor.objects.exclude(age=0).count()
    profession = Visitor.objects.exclude(profession='').count()
    experience = Visitor.objects.exclude(experience=0).count()
    city = Visitor.objects.exclude(city='').count()
    contact = Visitor.objects.exclude(phone='', telegram='').count()
    income = Visitor.objects.exclude(monthly_income=0).count()
    age_25 = Visitor.objects.filter(age__range=(1, 25)).count()
    age_25_40 = Visitor.objects.filter(age__gte=40).count()
    age_40 = Visitor.objects.filter(age__range=(25, 40)).count()
    city_mos = Visitor.objects.filter(city__icontains='москва').count()
    city_spb = Visitor.objects.filter(city__icontains='питер').count()
    city_other = Visitor.objects.exclude(city='').count() - city_spb - city_mos
    data = {
        'visits': visits,
        'events': events,
        'fio': fio,
        'age': age,
        'profession': profession,
        'experience': experience,
        'city': city,
        'contact': contact,
        'income': income,
        'age_25': age_25,
        'age_25_40': age_25_40,
        'age_40': age_40,
        'city_mos': city_mos,
        'city_spb': city_spb,
        'city_other': city_other,
    }
    styles = ['fest-program__card_black', 'fest-program__card_violet', 'fest-program__card_green']
    return render(request, "manage/manage_page.html", {'data': data, 'styles': styles})


class VisitorList(LoginRequiredMixin, ListView):
    model = Visitor
    ordering = '-visit_date'
    template_name = 'manage/visitors.html'
    context_object_name = 'visitors'
    paginate_by = 20

    def get_queryset(self):
        queryset = super().get_queryset().exclude(phone='', telegram='')
        self.filterset = VisitorFilter(self.request.GET, queryset)
        return self.filterset.qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filterset'] = self.filterset
        context['filter_on'] = True if len(self.filterset.data) else False
        return context


class VisitorUpdate(LoginRequiredMixin, UpdateView):
    form_class = VisitorForm
    model = Visitor
    template_name = 'manage/visitor_edit.html'
    success_url = reverse_lazy('visitors')


@csrf_exempt
def submit_data(request):
    try:
        data = json.loads(request.body.decode())
    except ValueError:
        return JsonResponse({'status': 'error'})

    try:
        obj, created = Visitor.objects.update_or_create(id=data['id'], defaults=data['data'])
        return JsonResponse({'status': 'ok', 'id': obj.id})
    except ValueError:
        return JsonResponse({'status': 'error'})


class EventList(LoginRequiredMixin, ListView):
    model = Event
    ordering = '-date'
    template_name = 'manage/events.html'
    context_object_name = 'events'
    paginate_by = 20

    def get_queryset(self):
        queryset = super(EventList, self).get_queryset()
        for row in queryset:
            row.count_rate = EventRating.objects.filter(event=row.id).count()
            row.rating = EventRating.objects.filter(event=row.id).aggregate(Avg('rate'))['rate__avg']
        return queryset


class EventCreate(LoginRequiredMixin, CreateView):
    form_class = EventForm
    model = Event
    template_name = 'manage/event_edit.html'
    success_url = reverse_lazy('events')


class EventUpdate(LoginRequiredMixin, UpdateView):
    form_class = EventForm
    model = Event
    template_name = 'manage/event_edit.html'
    success_url = reverse_lazy('events')


@login_required
def event_close(request, pk):
    event = Event.objects.get(id=pk)
    event.status = 2
    event.save()
    bot_settings = BotSettings.objects.first()
    users = Visitor.objects.filter(event=event, telegram_user_id__isnull=False)
    for user in users:

        markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
        for rating in range(1, 6):
            markup.add(types.KeyboardButton(str(rating)))
        bot.send_message(user.telegram_user_id, bot_settings.rate_text, reply_markup=markup)

        @bot.message_handler(func=lambda message: message.text in ['1', '2', '3', '4', '5'])
        def handle_rating(message):
            event_id = pk
            user = Visitor.objects.get(telegram_user_id=message.from_user.id)
            rating = int(message.text)
            markup = types.ReplyKeyboardRemove()
            event_rating = EventRating.objects.create(visitor=user, event_id=event_id, rate=rating,
                                                      text=f'User rated {rating}')
            bot.send_message(user.telegram_user_id, bot_settings.review_text, reply_markup=markup)
            bot.register_next_step_handler(message, finish)

        def finish(message):
            user = Visitor.objects.get(telegram_user_id=message.from_user.id)
            event_id = pk
            event_rating = EventRating.objects.filter(visitor=user, event_id=event_id)
            if event_rating:
                event_rating.text = message.text
                event_rating.save()

    return redirect('/manage/events/')


@login_required
def event_delete(request, pk):
    event = Event.objects.get(id=pk)
    event.status = 3
    event.save()

    return redirect('/manage/events/')


class EventRatingList(LoginRequiredMixin, ListView):
    model = EventRating
    template_name = 'manage/event_rating.html'
    context_object_name = 'rates'
    paginate_by = 20

    def get_queryset(self, **kwargs):
        queryset = super().get_queryset().filter(event=self.kwargs.get('pk'))
        self.filterset = EventRatingFilter(self.request.GET, queryset)
        return self.filterset.qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filterset'] = self.filterset
        context['event_id'] = self.kwargs.get('pk')
        context['event_name'] = Event.objects.filter(id=self.kwargs.get('pk')).values('name')[0]['name']
        context['filter_on'] = True if len(self.filterset.data) else False
        return context


class BotSettingsUpdate(LoginRequiredMixin, UpdateView):
    form_class = BotSettingsForm
    model = BotSettings
    template_name = 'manage/botsettings.html'
    success_url = reverse_lazy('botmessage')


class BotMessageList(LoginRequiredMixin, ListView):
    model = BotMessage
    ordering = '-date'
    template_name = 'manage/botmessages.html'
    context_object_name = 'botmessages'
    paginate_by = 20


def send_message_to_subscribers(message_text):
    subscribers = Visitor.objects.filter(telegram_user_id__isnull=False)
    for subscriber in subscribers:
        try:
            bot.send_message(subscriber.telegram_user_id, message_text)
        except Exception as e:
            print(f"Error sending message to user {subscriber.telegram_user_id}: {e}")


@login_required
def bot_message(request):
    botmessages = BotMessage.objects.all().order_by('-date')
    if request.method == 'POST':
        form = BotMessageForm(request.POST)
        if form.is_valid():
            message = form.save()
            message.save()
            message_text = form.cleaned_data['text']
            recipient = form.cleaned_data['recipient']
            send_message_to_subscribers(message_text)
            return redirect('botmessage')
    else:
        form = BotMessageForm()

    return render(request, 'manage/botmessages.html', {'form': form, 'botmessages': botmessages})


@login_required
def manage_settings(request):
    users = CustomUser.objects.all()
    return render(request, 'manage/settings.html', {'users': users})


@login_required
def customuser_create(request):
    form = CustomUserForm()
    if request.method == "POST":
        form = CustomUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.save()
            CustomUser.objects.create(user=user)
            return redirect('manage_settings')
        return redirect('user_create')
    return render(request, 'manage/user_edit.html', {'form': form})


class CustomUserUpdate(LoginRequiredMixin, UpdateView):
    form_class = CustomUserEditForm
    model = CustomUser
    template_name = 'manage/customuser_edit.html'
    success_url = reverse_lazy('manage_settings')


@login_required
def customuser_password(request, pk):
    if request.method == 'POST':
        password = request.POST.get('password')
        userid = request.POST.get('userid')
        user = User.objects.get(id=userid)
        user.set_password(password)
        user.save()
        return redirect('/manage/settings/')
    return render(request, 'manage/user_password.html', {'userid': pk})
