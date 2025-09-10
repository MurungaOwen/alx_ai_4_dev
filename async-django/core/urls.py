from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_page, name='notifications'),
    path('create-notification/', views.create_notification_view, name='create_notification'),
]
