from rest_framework import serializers
from .models import PurchaseOrder

class POSerializer(serializers.ModelSerializer):
    created_by_name  = serializers.CharField(source="created_by.full_name",  read_only=True, default="—")
    employee_name    = serializers.CharField(source="employee.full_name",     read_only=True, default=None)
    employee_emp_no  = serializers.CharField(source="employee.emp_no",        read_only=True, default=None)
    document_url     = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = PurchaseOrder
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "created_by_name",
                             "employee_name", "employee_emp_no", "document_url"]

    def get_document_url(self, obj):
        if obj.document:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.document.url) if request else obj.document.url
        return None

    def validate(self, attrs):
        for f in ["entry_date","invoice_start_dt","active_invoice_begin","active_invoice_end",
                  "invoice_end_dt","po_end_date","candidate_dob"]:
            if attrs.get(f) == "":
                attrs[f] = None
        for f in ["bill_rate","candidate_payrate","referral_rate","net_pay"]:
            if attrs.get(f) == "":
                attrs[f] = None
        if attrs.get("net_payment_terms") == "":
            attrs["net_payment_terms"] = None
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["created_by"] = request.user if request else None
        return super().create(validated_data)
