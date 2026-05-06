"""
Report views for HRMS — CBC Labs. Inc
All reports support JSON response + Excel/CSV export.
"""
import io
import csv
from datetime import date, timedelta

from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    EXCEL_AVAILABLE = True
except ImportError:
    EXCEL_AVAILABLE = False

from .models import Employee
from .serializers import EmployeeListSerializer


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_date(val):
    if not val:
        return None
    try:
        return date.fromisoformat(val)
    except Exception:
        return None


def apply_filters(request):
    """Apply common filters to Employee queryset."""
    qs = Employee.objects.all()

    status      = request.GET.get("status")
    emp_type    = request.GET.get("employment_type")
    visa_type   = request.GET.get("visa_type")
    location    = request.GET.get("location")
    employer    = request.GET.get("employer")
    joined_from = parse_date(request.GET.get("joined_from"))
    joined_to   = parse_date(request.GET.get("joined_to"))

    if status:
        qs = qs.filter(status=status)
    if emp_type:
        qs = qs.filter(employment_type=emp_type)
    if visa_type:
        qs = qs.filter(visa_type=visa_type)
    if location:
        qs = qs.filter(location__icontains=location)
    if employer:
        qs = qs.filter(employer__icontains=employer)
    if joined_from:
        qs = qs.filter(date_of_joining__gte=joined_from)
    if joined_to:
        qs = qs.filter(date_of_joining__lte=joined_to)

    return qs


def to_csv_response(rows: list[dict], filename: str) -> HttpResponse:
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'
    if not rows:
        return response
    writer = csv.DictWriter(response, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    return response


def to_excel_response(rows: list[dict], filename: str, title: str) -> HttpResponse:
    if not EXCEL_AVAILABLE:
        return to_csv_response(rows, filename)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = title[:31]

    # Header style
    header_fill = PatternFill("solid", fgColor="1E3A5F")
    header_font = Font(color="FFFFFF", bold=True, size=10)
    header_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
    thin = Side(border_style="thin", color="D0D0D0")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    if not rows:
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}.xlsx"'
        wb.save(response)
        return response

    headers = list(rows[0].keys())

    # Write headers
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header.replace("_", " ").title())
        cell.fill    = header_fill
        cell.font    = header_font
        cell.alignment = header_align
        cell.border  = border
        ws.column_dimensions[cell.column_letter].width = max(15, len(str(header)) + 4)

    ws.row_dimensions[1].height = 25

    # Alternate row colors
    fill_light = PatternFill("solid", fgColor="F0F4F8")
    fill_white = PatternFill("solid", fgColor="FFFFFF")
    alert_fill = PatternFill("solid", fgColor="FEE2E2")  # red for H1B bench

    for row_idx, row in enumerate(rows, 2):
        is_alert = row.get("_alert", False)
        fill = alert_fill if is_alert else (fill_light if row_idx % 2 == 0 else fill_white)
        for col_idx, key in enumerate(headers, 1):
            if key.startswith("_"):
                continue
            val  = row.get(key, "")
            cell = ws.cell(row=row_idx, column=col_idx, value=str(val) if val else "")
            cell.fill   = fill
            cell.border = border
            cell.alignment = Alignment(vertical="center")

    ws.freeze_panes = "A2"

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)

    response = HttpResponse(
        buf.read(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}.xlsx"'
    return response


def employee_to_row(emp: Employee) -> dict:
    """Convert Employee to flat dict for export."""
    return {
        "emp_no":           emp.emp_no,
        "first_name":       emp.first_name,
        "middle_name":      emp.middle_name,
        "last_name":        emp.last_name,
        "status":           emp.status,
        "employment_type":  emp.employment_type,
        "employer":         emp.employer,
        "client":           emp.client,
        "customer":         emp.customer,
        "designation":      emp.designation,
        "date_of_joining":  str(emp.date_of_joining) if emp.date_of_joining else "",
        "exit_date":        str(emp.exit_date)        if emp.exit_date        else "",
        "location":         emp.location,
        "visa_type":        emp.visa_type,
        "id_status":        emp.id_status,
        "e_verify_status":  emp.e_verify_status,
        "official_email":   emp.official_email,
        "personal_email":   emp.personal_email,
        "contact_number":   emp.contact_number,
        "gender":           emp.gender,
        "primary_skills":   emp.primary_skills,
        "secondary_skills": emp.secondary_skills,
        "address":          emp.address,
        "worksite_address": emp.worksite_address,
    }


# ── Report 1 — Employee Master Report ────────────────────────────────────────

class EmployeeMasterReportView(APIView):
    """
    GET /api/reports/employee-master/
    Query params: status, employment_type, visa_type, location,
                  employer, joined_from, joined_to, export (csv/excel)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs     = apply_filters(request).order_by("last_name", "first_name")
        export = request.GET.get("export", "")
        rows   = [employee_to_row(e) for e in qs]

        if export == "csv":
            return to_csv_response(rows, "employee_master_report")
        if export == "excel":
            return to_excel_response(rows, "employee_master_report", "Employee Master")

        return Response({
            "title":   "Employee Master Report",
            "count":   len(rows),
            "results": EmployeeListSerializer(qs, many=True).data,
        })


# ── Report 2 — Visa Status Report ────────────────────────────────────────────

class VisaStatusReportView(APIView):
    """
    GET /api/reports/visa-status/
    Shows breakdown by visa type + flags H1B employees on bench.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs     = apply_filters(request)
        export = request.GET.get("export", "")

        # Breakdown by visa type
        visa_types = ["GC", "USC", "H1B", "L1", "OPT", "CPT", "TN", "other"]
        breakdown  = []
        for vt in visa_types:
            employees = qs.filter(visa_type=vt)
            if employees.exists():
                breakdown.append({
                    "visa_type": vt,
                    "total":     employees.count(),
                    "active":    employees.filter(status="active").count(),
                    "bench":     employees.filter(status="bench").count(),
                    "exited":    employees.filter(status="exited").count(),
                })

        # H1B on bench — critical alert
        h1b_on_bench = qs.filter(visa_type="H1B", status="bench")

        if export in ("csv", "excel"):
            rows = []
            for emp in qs.order_by("visa_type", "last_name", "first_name"):
                row = employee_to_row(emp)
                row["_alert"] = emp.visa_type == "H1B" and emp.status == "bench"
                rows.append(row)
            if export == "csv":
                return to_csv_response(rows, "visa_status_report")
            return to_excel_response(rows, "visa_status_report", "Visa Status")

        return Response({
            "title":          "Visa Status Report",
            "breakdown":      breakdown,
            "h1b_bench_alert": EmployeeListSerializer(h1b_on_bench, many=True).data,
            "h1b_bench_count": h1b_on_bench.count(),
        })


# ── Report 3 — Employment Type Report ────────────────────────────────────────

class EmploymentTypeReportView(APIView):
    """
    GET /api/reports/employment-type/
    Breakdown by W2 / C2C / 1099 / Full Time.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs     = apply_filters(request)
        export = request.GET.get("export", "")

        emp_types = [("w2","W2"),("c2c","C2C"),("1099","1099"),("fulltime","Full Time")]
        breakdown = []
        for val, label in emp_types:
            employees = qs.filter(employment_type=val)
            if employees.exists():
                breakdown.append({
                    "employment_type":       val,
                    "employment_type_label": label,
                    "total":  employees.count(),
                    "active": employees.filter(status="active").count(),
                    "bench":  employees.filter(status="bench").count(),
                    "exited": employees.filter(status="exited").count(),
                })

        if export in ("csv", "excel"):
            rows = [employee_to_row(e) for e in qs.order_by("employment_type", "last_name", "first_name")]
            if export == "csv":
                return to_csv_response(rows, "employment_type_report")
            return to_excel_response(rows, "employment_type_report", "Employment Type")

        return Response({
            "title":     "Employment Type Report",
            "breakdown": breakdown,
            "results":   EmployeeListSerializer(qs, many=True).data,
        })


# ── Report 4 — Bench Report ───────────────────────────────────────────────────

class BenchReportView(APIView):
    """
    GET /api/reports/bench/
    All bench employees, sorted by bench duration.
    H1B bench employees flagged as critical.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs     = Employee.objects.filter(status="bench").order_by("date_of_joining")
        export = request.GET.get("export", "")
        today  = timezone.now().date()

        results = []
        for emp in qs:
            bench_since = emp.date_of_joining
            days_on_bench = (today - bench_since).days if bench_since else None
            is_h1b_critical = emp.visa_type == "H1B"
            results.append({
                "id":               emp.id,
                "emp_no":           emp.emp_no,
                "full_name":         emp.full_name,
                "visa_type":        emp.visa_type,
                "employment_type":  emp.employment_type,
                "location":         emp.location,
                "bench_since":      str(bench_since) if bench_since else "",
                "days_on_bench":    days_on_bench,
                "is_h1b_critical":  is_h1b_critical,
                "primary_skills":   emp.primary_skills,
                "contact_number":   emp.contact_number,
                "official_email":   emp.official_email,
            })

        if export in ("csv", "excel"):
            rows = [{k: v for k, v in r.items() if k != "id"} for r in results]
            for r in rows:
                r["_alert"] = r.get("is_h1b_critical", False)
            if export == "csv":
                return to_csv_response(rows, "bench_report")
            return to_excel_response(rows, "bench_report", "Bench Report")

        return Response({
            "title":            "Bench Report",
            "total_bench":      len(results),
            "h1b_critical_count": sum(1 for r in results if r["is_h1b_critical"]),
            "results":          results,
        })


# ── Report 5 — Client / Employer Report ──────────────────────────────────────

class ClientReportView(APIView):
    """
    GET /api/reports/client/
    Employees grouped by current client/employer.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs     = Employee.objects.filter(status="active").exclude(client="")
        export = request.GET.get("export", "")

        # Group by client
        clients = qs.values_list("client", flat=True).distinct().order_by("client")
        grouped = []
        for client_name in clients:
            employees = qs.filter(client=client_name)
            grouped.append({
                "client":    client_name,
                "count":     employees.count(),
                "employees": EmployeeListSerializer(employees, many=True).data,
            })

        if export in ("csv", "excel"):
            rows = []
            for emp in qs.order_by("client", "last_name", "first_name"):
                rows.append({
                    "employer":         emp.employer,
                    "client":           emp.client,
                    "customer":         emp.customer,
                    "emp_no":           emp.emp_no,
                    "full_name":        emp.full_name,
                    "designation":      emp.designation,
                    "employment_type":  emp.employment_type,
                    "visa_type":        emp.visa_type,
                    "date_of_joining":  str(emp.date_of_joining) if emp.date_of_joining else "",
                    "exit_date":        str(emp.exit_date)        if emp.exit_date        else "",
                    "location":         emp.location,
                    "official_email":   emp.official_email,
                    "contact_number":   emp.contact_number,
                })
            if export == "csv":
                return to_csv_response(rows, "client_report")
            return to_excel_response(rows, "client_report", "Client Report")

        return Response({
            "title":   "Client / Employer Report",
            "grouped": grouped,
        })


# ── Report 6 — Individual Employee History Report ─────────────────────────────

class EmployeeHistoryReportView(APIView):
    """
    GET /api/employees/{id}/history-report/
    Full employment history for a single employee.
    export=excel or export=csv
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        from .models import Employee, EmploymentHistory
        from django.shortcuts import get_object_or_404

        employee = get_object_or_404(Employee, pk=pk)
        history  = EmploymentHistory.objects.filter(
            employee=employee
        ).select_related("recorded_by").order_by("-recorded_at")

        export = request.GET.get("export", "")

        rows = []
        # Current record first
        rows.append({
            "record_type":      "CURRENT",
            "emp_no":           employee.emp_no,
            "full_name":        employee.full_name,
            "employer":         employee.employer,
            "client":           employee.client,
            "customer":         employee.customer,
            "designation":      employee.designation,
            "employment_type":  employee.employment_type,
            "status":           employee.status,
            "date_of_joining":  str(employee.date_of_joining) if employee.date_of_joining else "",
            "exit_date":        str(employee.exit_date)        if employee.exit_date        else "Present",
            "location":         employee.location,
            "worksite_address": employee.worksite_address,
            "visa_type":        employee.visa_type,
            "id_status":        employee.id_status,
            "e_verify_status":  employee.e_verify_status,
            "primary_skills":   employee.primary_skills,
            "secondary_skills": employee.secondary_skills,
            "recorded_at":      str(employee.updated_at.strftime("%Y-%m-%d %H:%M")),
            "recorded_by":      "",
        })

        # History records
        for h in history:
            rows.append({
                "record_type":      "HISTORY",
                "emp_no":           employee.emp_no,
                "full_name":        employee.full_name,
                "employer":         h.employer,
                "client":           h.client,
                "customer":         h.customer,
                "designation":      h.designation,
                "employment_type":  h.employment_type,
                "status":           h.status,
                "date_of_joining":  str(h.date_of_joining) if h.date_of_joining else "",
                "exit_date":        str(h.exit_date)        if h.exit_date        else "",
                "location":         h.location,
                "worksite_address": h.worksite_address,
                "visa_type":        h.visa_type,
                "id_status":        h.id_status,
                "e_verify_status":  h.e_verify_status,
                "primary_skills":   h.primary_skills,
                "secondary_skills": h.secondary_skills,
                "recorded_at":      h.recorded_at.strftime("%Y-%m-%d %H:%M"),
                "recorded_by":      h.recorded_by.full_name if h.recorded_by else "",
            })

        filename = f"employment_history_{employee.emp_no}"

        if export == "csv":
            return to_csv_response(rows, filename)
        if export == "excel":
            return to_excel_response(rows, filename, f"History {employee.emp_no}")

        # JSON response
        return Response({
            "employee":      employee.full_name,
            "emp_no":        employee.emp_no,
            "total_records": len(rows),
            "history":       rows,
        })
