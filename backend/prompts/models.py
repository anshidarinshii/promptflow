from django.db import models
from django.contrib.auth.models import User

class Prompt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prompts')
    original_text = models.TextField()
    optimized_text = models.TextField(blank=True, null=True)
    stage = models.CharField(max_length=50, default='Input')
    model_name = models.CharField(max_length=100, default='Gemini 1.5 Pro')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prompt {self.id} - {self.user.username}"
