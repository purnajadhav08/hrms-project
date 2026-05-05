from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    message = "Admin access required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "admin"
        )


class IsAdminOrReadSelf(BasePermission):
    """Admin can do anything. HR can only read their own profile."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return request.method in SAFE_METHODS and obj == request.user
