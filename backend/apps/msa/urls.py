from rest_framework.routers import DefaultRouter
from .views import MSAViewSet

router = DefaultRouter()
router.register(r"", MSAViewSet, basename="msa")
urlpatterns = router.urls
