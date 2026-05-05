import logging
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import send_hr_approval_request, send_hr_approved_email
from .permissions import IsAdmin
from .serializers import (
    SignupSerializer,
    UserProfileSerializer,
    HRListSerializer,
    HRUpdateSerializer,
)

logger = logging.getLogger(__name__)
User   = get_user_model()


def issue_tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


# ── Login (no OTP — direct JWT after password) ────────────────────────────────

class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { email, password }
    Response: { user, tokens }
    Dhananjay: "no need for verification code"
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get("email", "").lower().strip()
        password = request.data.get("password", "")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "Your account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user.role == "hr" and not user.is_approved:
            return Response(
                {"error": "Your account is pending Admin approval. Please wait."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            "message": "Login successful.",
            "user":    UserProfileSerializer(user).data,
            "tokens":  issue_tokens(user),
        })


# ── Signup ────────────────────────────────────────────────────────────────────

class AdminSignupView(generics.CreateAPIView):
    serializer_class   = SignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        User.objects.create_user(
            role="admin", is_approved=True, is_staff=True,
            **s.validated_data
        )
        return Response(
            {"message": "Admin account created. Please log in."},
            status=status.HTTP_201_CREATED,
        )


class HRSignupView(generics.CreateAPIView):
    serializer_class   = SignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.create_user(
            role="hr", is_approved=False,
            **s.validated_data
        )
        admins = User.objects.filter(role="admin", is_active=True)
        if admins.exists():
            send_hr_approval_request(user, list(admins))
        return Response(
            {"message": "Account created. An Admin will review your request."},
            status=status.HTTP_201_CREATED,
        )


# ── Profile ───────────────────────────────────────────────────────────────────

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


# ── Admin: HR Management ──────────────────────────────────────────────────────

class HRManagementViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]

    def _get_hr(self, pk):
        return get_object_or_404(User, pk=pk, role="hr")

    def list(self, request):
        qs = User.objects.filter(role="hr").order_by("-date_joined")
        return Response(HRListSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None):
        return Response(UserProfileSerializer(self._get_hr(pk)).data)

    def update(self, request, pk=None):
        hr = self._get_hr(pk)
        s  = HRUpdateSerializer(hr, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response({"message": "HR updated.", "user": s.data})

    def destroy(self, request, pk=None):
        hr   = self._get_hr(pk)
        name = hr.full_name or hr.email
        hr.delete()
        return Response({"message": f"{name} deleted."})

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        hr = self._get_hr(pk)
        if hr.is_approved:
            return Response({"message": "Already approved."})
        hr.is_approved = True
        hr.save()
        send_hr_approved_email(hr)
        return Response({"message": f"{hr.full_name} approved."})

    @action(detail=True, methods=["post"], url_path="revoke")
    def revoke(self, request, pk=None):
        hr = self._get_hr(pk)
        hr.is_approved = False
        hr.save()
        return Response({"message": f"Access revoked for {hr.full_name}."})
