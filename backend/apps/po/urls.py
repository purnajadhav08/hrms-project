from rest_framework.routers import DefaultRouter
from .views import POViewSet

router = DefaultRouter()
router.register(r"", POViewSet, basename="po")
urlpatterns = router.urls
