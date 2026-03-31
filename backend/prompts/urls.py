from django.urls import path
from .views import PromptHistoryView, OptimizerView

urlpatterns = [
    path('history/', PromptHistoryView.as_view(), name='prompt-history'),
    path('optimize/', OptimizerView.as_view(), name='prompt-optimize'),
]
