from django.contrib import admin
from .models import Employee, EmploymentHistory


class EmploymentHistoryInline(admin.TabularInline):
    model   = EmploymentHistory
    extra   = 0
    can_delete = False
    readonly_fields = [
        "employer", "designation", "employment_type",
        "location", "status", "date_of_joining", "exit_date",
        "primary_skills", "secondary_skills",
        "visa_type", "id_status", "e_verify_status",
        "recorded_at", "recorded_by",
    ]

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display   = [
        "adf_employee_name", "emp_no", "status", "employer",
        "designation", "employment_type", "visa_type", "location", "updated_at"
    ]
    list_filter    = ["status", "employment_type", "visa_type", "gender"]
    search_fields  = ["emp_no"]
    ordering       = ["adf_employee_name"]
    readonly_fields= ["created_by", "updated_by", "created_at", "updated_at"]
    inlines        = [EmploymentHistoryInline]

    fieldsets = (
        ("Identity",    {"fields": (
            "adf_employee_name", "emp_no", "gender", "dob",
            "retirement_dob", "contact_number",
            "official_email", "personal_email", "address",
        )}),
        ("Employment",  {"fields": (
            "status", "employment_type", "date_of_joining", "exit_date",
            "employer", "designation",
            "primary_skills", "secondary_skills",
            "location", "worksite_address",
        )}),
        ("Visa",        {"fields": ("visa_type", "id_status", "e_verify_status")}),
        ("Audit",       {"fields": ("created_by", "updated_by", "created_at", "updated_at")}),
    )


@admin.register(EmploymentHistory)
class EmploymentHistoryAdmin(admin.ModelAdmin):
    list_display  = ["employee", "employer", "designation", "status", "recorded_at", "recorded_by"]
    list_filter   = ["status", "visa_type"]
    search_fields = ["employee__emp_no"]
    readonly_fields = [f.name for f in EmploymentHistory._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
