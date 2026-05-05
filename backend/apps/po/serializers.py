from rest_framework import serializers
from .models import PurchaseOrder

class POSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default="—")

    class Meta:
        model  = PurchaseOrder
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "created_by_name"]

    def validate(self, attrs):
        for f in ["entry_date","invoice_start_dt","active_invoice_begin","active_invoice_end",
                  "invoice_end_dt","po_end_date"]:
            if attrs.get(f) == "":
                attrs[f] = None
        for f in ["bill_rate","candidate_payrate","referral_rate"]:
            if attrs.get(f) == "":
                attrs[f] = None
        if attrs.get("net_payment_terms") == "":
            attrs["net_payment_terms"] = None
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["created_by"] = request.user if request else None
        return super().create(validated_data)
