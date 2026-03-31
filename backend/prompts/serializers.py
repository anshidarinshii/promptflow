from rest_framework import serializers
from .models import Prompt

class PromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = ('id', 'user', 'original_text', 'optimized_text', 'stage', 'model_name', 'created_at')
        read_only_fields = ('user', 'created_at')
