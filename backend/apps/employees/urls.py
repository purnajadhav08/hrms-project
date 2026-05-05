from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, EmployeeDashboardStatsView
from .reports import (
    EmployeeMasterReportView,
    VisaStatusReportView,
    EmploymentTypeReportView,
    BenchReportView,
    ClientReportView,
    EmployeeHistoryReportView,
)

router = DefaultRouter()
router.register(r"", EmployeeViewSet, basename="employee")

urlpatterns = [
    # Dashboard stats
    path("stats/",                    EmployeeDashboardStatsView.as_view(), name="employee-stats"),
    # Reports
    path("reports/employee-master/",  EmployeeMasterReportView.as_view(),  name="report-employee-master"),
    path("reports/visa-status/",      VisaStatusReportView.as_view(),      name="report-visa-status"),
    path("reports/employment-type/",  EmploymentTypeReportView.as_view(),  name="report-employment-type"),
    path("reports/bench/",            BenchReportView.as_view(),           name="report-bench"),
    path("reports/client/",           ClientReportView.as_view(),          name="report-client"),
    # Individual employee history report
    path("<int:pk>/history-report/",  EmployeeHistoryReportView.as_view(), name="report-employee-history"),
    # Employee CRUD
    path("", include(router.urls)),
]
