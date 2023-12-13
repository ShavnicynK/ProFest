from django.db import models
from django.contrib.auth.models import User


class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=500)
    date = models.DateField()
    start_time = models.TimeField()
    finish_time = models.TimeField()
    link = models.CharField(max_length=500, blank=True)
    status = models.IntegerField(default=1)

    def __str__(self):
        return f'{self.name}'


class Visitor(models.Model):
    mobile = 'M'
    desktop = 'D'
    TYPES_D = [
        (mobile, 'M'),
        (desktop, 'D'),
    ]

    y_event = 'Y'
    n_event = 'N'
    TYPES_E = [
        (y_event, 'Хочет участвовать'),
        (n_event, 'Не заинтересовало'),
    ]

    fio = models.CharField(max_length=255, blank=True)
    age = models.PositiveIntegerField(default=0)
    city = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    telegram = models.CharField(max_length=35, blank=True)
    profession = models.CharField(max_length=255, blank=True)
    experience = models.CharField(max_length=255, blank=True)
    monthly_income = models.PositiveIntegerField(default=0)
    hourly_income = models.PositiveIntegerField(default=0)
    visit_date = models.DateTimeField(auto_now_add=True)
    referrer = models.CharField(max_length=255, blank=True)
    visit_duration = models.PositiveIntegerField(default=0)
    device = models.CharField(max_length=1, choices=TYPES_D, default=desktop)
    want_event = models.CharField(max_length=1, choices=TYPES_E, default=y_event)
    event = models.ManyToManyField(Event, through='VisitorEvent', related_name='vevent', blank=True)
    status = models.IntegerField(default=1)
    telegram_user_id = models.IntegerField(unique=True, null=True, blank=True)
    note = models.CharField(max_length=500, blank=True)


class VisitorEvent(models.Model):
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)


class EventRating(models.Model):
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    rate = models.IntegerField(default=0)
    text = models.CharField(max_length=500)


class BotMessage(models.Model):
    text = models.CharField(max_length=500)
    date = models.DateTimeField(auto_now_add=True)


class BotSettings(models.Model):
    start_text = models.CharField(max_length=800, default='')
    stiker_text = models.CharField(max_length=800, default='')
    subscribe_text = models.CharField(max_length=800, default='')
    remind_text = models.CharField(max_length=800, default='')
    link_text = models.CharField(max_length=800, default='')
    rate_text = models.CharField(max_length=800, default='')
    review_text = models.CharField(max_length=800, default='')
    bot_link = models.CharField(max_length=200, default='')


class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telegram = models.CharField(max_length=35, blank=True)
    telegram_user_id = models.IntegerField(unique=True, null=True, blank=True)
    report = models.IntegerField(default=0)


class Attendance(models.Model):
    date = models.DateField()
    count = models.IntegerField(default=0)








