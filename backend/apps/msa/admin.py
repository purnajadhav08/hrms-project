from django.contrib import admin
from .models import MSA


@admin.register(MSA)
class MSAAdmin(admin.ModelAdmin):
    list_display  = ["vendor_name", "client_name", "status", "mutually_executed", "date_of_execution", "msa_validity", "created_at"]
    list_filter   = ["status", "msa_validity", "mutually_executed"]
    search_fields = ["vendor_name", "client_name", "fein_number"]
    ordering      = ["-created_at"]
    readonly_fields = ["created_by", "created_at", "updated_at"]
