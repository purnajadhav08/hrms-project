from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display   = ["email", "full_name", "role", "is_approved", "account_status", "date_joined"]
    list_filter    = ["role", "is_approved", "account_status"]
    search_fields  = ["email", "full_name", "emp_no"]
    ordering       = ["-date_joined"]

    fieldsets = (
        ("Login",      {"fields": ("email", "password")}),
        ("Profile",    {"fields": ("full_name", "role", "is_approved", "is_active", "is_staff")}),
        ("Employment", {"fields": ("emp_no", "designation", "employer", "employment_type",
                                   "account_status", "date_of_joining", "exit_date",
                                   "primary_skills", "secondary_skills", "location")}),
        ("Personal",   {"fields": ("gender", "dob", "contact_number", "personal_email",
                                   "official_email", "address", "worksite_address")}),
        ("Visa",       {"fields": ("visa_type", "id_status", "e_verify_status")}),
        ("Permissions",{"fields": ("groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "full_name", "role", "password1", "password2")}),
    )
    filter_horizontal = ("groups", "user_permissions")

    actions = ["approve_hrs"]

    @admin.action(description="Approve selected HR users")
    def approve_hrs(self, request, queryset):
        queryset.filter(role="hr").update(is_approved=True)


@admin.register(OTPToken)
class OTPTokenAdmin(admin.ModelAdmin):
    list_display = ["user", "code", "expires_at", "used", "created_at"]
    list_filter  = ["used"]
    readonly_fields = ["code", "created_at"]
