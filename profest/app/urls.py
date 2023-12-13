from django.urls import path
from .views import *

urlpatterns = [
    path('', index_view, name='landing'),
    path('manage/', manage_page, name='manage'),
    path('manage/visitors/', VisitorList.as_view(), name='visitors'),
    path('manage/visitors/edit/<int:pk>', VisitorUpdate.as_view(), name='visitor_update'),
    path('manage/events/', EventList.as_view(), name='events'),
    path('manage/events/create/', EventCreate.as_view(), name='event_create'),
    path('manage/events/edit/<int:pk>', EventUpdate.as_view(), name='event_update'),
    path('manage/events/close/<int:pk>', event_close, name='event_close'),
    path('manage/events/delete/<int:pk>', event_delete, name='event_delete'),
    path('manage/events/rating/<int:pk>', EventRatingList.as_view(), name='event_rating'),
    path('manage/bot/', bot_message, name='botmessage'),
    path('manage/settings/', manage_settings, name='manage_settings'),
    path('manage/settings/bot/<int:pk>', BotSettingsUpdate.as_view(), name='botsettings'),
    path('manage/settings/user_create', customuser_create, name='user_create'),
    path('manage/settings/user_edit/<int:pk>', CustomUserUpdate.as_view(), name='user_edit'),
    path('manage/settings/user_password/<int:pk>', customuser_password, name='user_password'),
    path('submit_data/', submit_data, name='submit_data'),
]

