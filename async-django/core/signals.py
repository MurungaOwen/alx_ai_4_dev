from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from .models import Notification

@receiver(post_save, sender=Notification)
async def notification_created(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f"user_{instance.user.id}",
            {
                "type": "send_notification",
                "message": instance.message,
            },
        )
