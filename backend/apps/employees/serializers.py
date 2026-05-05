from rest_framework import serializers
from .models import Employee, EmploymentHistory


class EmploymentHistorySerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(
        source="recorded_by.full_name", read_only=True, default="—"
    )

    class Meta:
        model  = EmploymentHistory
        fields = [
            "id", "employer", "designation", "employment_type",
            "location", "worksite_address", "status",
            "date_of_joining", "exit_date",
            "primary_skills", "secondary_skills",
            "visa_type", "id_status", "e_verify_status",
            "recorded_at", "recorded_by_name",
        ]


class EmployeeListSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Employee
        fields = [
            "id", "adf_employee_name", "emp_no", "status",
            "employment_type", "employer", "designation",
            "primary_skills", "location", "visa_type",
            "date_of_joining", "exit_date",
            "official_email", "contact_number", "updated_at",
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    employment_history = EmploymentHistorySerializer(many=True, read_only=True)
    created_by_name    = serializers.CharField(source="created_by.full_name", read_only=True, default="—")
    updated_by_name    = serializers.CharField(source="updated_by.full_name", read_only=True, default="—")

    class Meta:
        model  = Employee
        fields = [
            "id",
            # Identity
            "adf_employee_name", "emp_no", "gender", "dob", "retirement_dob",
            "contact_number", "official_email", "personal_email",
            "address", "worksite_address",
            # Employment
            "status", "employment_type", "date_of_joining", "exit_date",
            "employer", "designation", "primary_skills", "secondary_skills", "location",
            # Visa
            "visa_type", "id_status", "e_verify_status",
            # Audit
            "created_by_name", "updated_by_name", "created_at", "updated_at",
            # History
            "employment_history",
        ]
        read_only_fields = [
            "id", "created_at", "updated_at",
            "created_by_name", "updated_by_name", "employment_history",
        ]

    def validate_emp_no(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Employee number is required.")
        return value.strip().upper()

    def validate_adf_employee_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Employee name is required.")
        return value.strip()

    def validate(self, attrs):
        # Convert empty optional date strings to None
        for field in ("retirement_dob", "date_of_joining", "exit_date"):
            if attrs.get(field) == "":
                attrs[field] = None

        # Exit date must be after joining date if both provided
        doj  = attrs.get("date_of_joining")
        exit = attrs.get("exit_date")
        if doj and exit and exit < doj:
            raise serializers.ValidationError(
                {"exit_date": "Exit date cannot be before date of joining."}
            )
        return attrs

    def update(self, instance, validated_data):
        request    = self.context.get("request")
        changed_by = request.user if request else None

        # Only trigger history when employer (client) or status changes
        # Option B: client switch OR going to bench/active
        CLIENT_FIELDS = ["employer", "status"]

        needs_history = any(
            str(validated_data.get(f, getattr(instance, f))) != str(getattr(instance, f))
            for f in CLIENT_FIELDS
            if f in validated_data
        )

        if needs_history:
            instance.save_history_snapshot(changed_by=changed_by)

        validated_data["updated_by"] = changed_by
        return super().update(instance, validated_data)

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["created_by"] = request.user if request else None
        validated_data["updated_by"] = request.user if request else None
        return super().create(validated_data)
