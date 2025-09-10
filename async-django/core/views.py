from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

@login_required
def notification_page(request):
    return render(request, 'notifications.html')

def create_notification_view(request):
    # This is a demo view to trigger a notification.
    # In a real application, this would be triggered by some event.
    user = User.objects.first() # for demo purposes, get the first user
    if user:
        Notification.objects.create(user=user, message="You have a new follower")
        return HttpResponse("Notification created for the first user.")
    return HttpResponse("No users in the database to create a notification for.")