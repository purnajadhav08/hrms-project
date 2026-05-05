from django.contrib import admin
from .models import PurchaseOrder

@admin.register(PurchaseOrder)
class POAdmin(admin.ModelAdmin):
    list_display  = ["candidate_name","billable_client_name","end_client_name",
                    "po_status","invoice_status","bill_rate","po_end_date","entry_date"]
    list_filter   = ["po_status","invoice_status","candidate_pay_type","work_location_type"]
    search_fields = ["candidate_name","candidate_email","billable_client_name","end_client_name"]
