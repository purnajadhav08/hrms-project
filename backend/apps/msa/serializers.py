from rest_framework import serializers
from .models import MSA


class MSASerializer(serializers.ModelSerializer):
    created_by_name  = serializers.CharField(source="created_by.full_name", read_only=True, default="—")
    employee_name    = serializers.CharField(source="employee.full_name",    read_only=True, default=None)
    employee_emp_no  = serializers.CharField(source="employee.emp_no",       read_only=True, default=None)
    document_url     = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = MSA
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "created_by_name",
                             "employee_name", "employee_emp_no", "document_url"]

    def get_document_url(self, obj):
        if obj.document:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.document.url) if request else obj.document.url
        return None

    def validate(self, attrs):
        for f in ["date_of_execution", "msa_start_date", "msa_end_date"]:
            if attrs.get(f) == "":
                attrs[f] = None
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["created_by"] = request.user if request else None
        return super().create(validated_data)
