from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, CharFilter, ChoiceFilter, DateFilter

from .models import Employee, EmploymentHistory
from .serializers import (
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    EmploymentHistorySerializer,
)


# ── Filter ────────────────────────────────────────────────────────────────────

class EmployeeFilter(FilterSet):
    name        = CharFilter(field_name="adf_employee_name", lookup_expr="icontains")
    emp_no      = CharFilter(field_name="emp_no",            lookup_expr="icontains")
    employer    = CharFilter(field_name="employer",          lookup_expr="icontains")
    designation = CharFilter(field_name="designation",       lookup_expr="icontains")
    location    = CharFilter(field_name="location",          lookup_expr="icontains")
    skills      = CharFilter(field_name="primary_skills",    lookup_expr="icontains")
    status      = ChoiceFilter(choices=[
        ("active","Active"),("exited","Exited"),("bench","Bench")
    ])
    visa_type   = ChoiceFilter(choices=[
        ("GC","GC"),("USC","USC"),("H1B","H1B"),("L1","L1"),
        ("OPT","OPT"),("CPT","CPT"),("TN","TN"),("other","other"),
    ])
    joined_from = DateFilter(field_name="date_of_joining", lookup_expr="gte")
    joined_to   = DateFilter(field_name="date_of_joining", lookup_expr="lte")

    class Meta:
        model  = Employee
        fields = []


# ── Dashboard Stats ───────────────────────────────────────────────────────────

class EmployeeDashboardStatsView(APIView):
    """GET /api/employees/stats/ — summary counts for dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Employee.objects.all()
        total    = qs.count()
        active   = qs.filter(status="active").count()
        exited   = qs.filter(status="exited").count()
        bench    = qs.filter(status="bench").count()

        # Visa breakdown
        visa_breakdown = (
            qs.values("visa_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # Employment type breakdown
        emp_type_breakdown = (
            qs.values("employment_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        # Top employers
        top_employers = (
            qs.exclude(employer="")
            .values("employer")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        # Recent additions (last 5)
        recent = EmployeeListSerializer(
            qs.order_by("-created_at")[:5], many=True
        ).data

        # Change 5: employees going to bench within 10 days (exit_date approaching)
        from django.utils import timezone
        from datetime import timedelta
        today      = timezone.now().date()
        in_10_days = today + timedelta(days=10)
        bench_soon = EmployeeListSerializer(
            qs.filter(
                status="active",
                exit_date__isnull=False,
                exit_date__lte=in_10_days,
                exit_date__gte=today,
            ).order_by("exit_date"),
            many=True,
        ).data

        return Response({
            "total":               total,
            "active":              active,
            "exited":              exited,
            "bench":               bench,
            "bench_soon":          bench_soon,
            "visa_breakdown":      list(visa_breakdown),
            "emp_type_breakdown":  list(emp_type_breakdown),
            "top_employers":       list(top_employers),
            "recent_employees":    recent,
        })


# ── Employee ViewSet ──────────────────────────────────────────────────────────

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for employees — Admin and HR both have full access.

    GET    /api/employees/               list + search + filter
    POST   /api/employees/               create
    GET    /api/employees/{id}/          full detail + history
    PUT    /api/employees/{id}/          update (auto-saves history)
    PATCH  /api/employees/{id}/          partial update
    DELETE /api/employees/{id}/          delete
    GET    /api/employees/{id}/history/  employment history only
    """
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = EmployeeFilter
    search_fields      = ["emp_no"]
    ordering_fields = [
        "adf_employee_name", "emp_no", "date_of_joining",
        "status", "employer", "updated_at",
    ]
    ordering = ["adf_employee_name"]

    def get_queryset(self):
        return Employee.objects.select_related(
            "created_by", "updated_by"
        ).prefetch_related("employment_history__recorded_by")

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        """GET /api/employees/{id}/history/ — full employment history."""
        employee = self.get_object()
        history  = employee.employment_history.all()
        return Response(EmploymentHistorySerializer(history, many=True).data)
