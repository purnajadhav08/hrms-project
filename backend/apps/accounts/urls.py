from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, AdminSignupView, HRSignupView,
    MeView, HRManagementViewSet,
)

router = DefaultRouter()
router.register(r"admin/hrs", HRManagementViewSet, basename="hr-management")

urlpatterns = [
    # Auth — direct login, no OTP
    path("auth/login/",         LoginView.as_view(),       name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(),name="token-refresh"),
    path("auth/admin/signup/",  AdminSignupView.as_view(), name="admin-signup"),
    path("auth/hr/signup/",     HRSignupView.as_view(),    name="hr-signup"),
    path("auth/me/",            MeView.as_view(),          name="me"),
    # Admin HR management
    path("", include(router.urls)),
]
