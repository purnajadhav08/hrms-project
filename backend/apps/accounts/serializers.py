from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()
COMPANY_DOMAIN = "cbcinc.ai"


def validate_company_email(email: str):
    if not email.lower().endswith(f"@{COMPANY_DOMAIN}"):
        raise serializers.ValidationError(
            f"Only @{COMPANY_DOMAIN} email addresses are allowed."
        )
    return email.lower()


class SignupSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm Password")

    class Meta:
        model  = User
        fields = ["full_name", "email", "password", "password2"]

    def validate_email(self, value):
        return validate_company_email(value)

    def validate_full_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return value.strip()

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model   = User
        exclude = ["password", "groups", "user_permissions"]


class HRListSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "id", "full_name", "email", "emp_no", "designation",
            "account_status", "is_approved", "date_joined",
            "contact_number", "location", "visa_type",
        ]


class HRUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model   = User
        exclude = [
            "password", "role", "is_staff", "is_superuser",
            "groups", "user_permissions", "last_login", "date_joined",
        ]
        read_only_fields = ["id", "email"]

    def validate_emp_no(self, value):
        return value if value else None

    def validate(self, attrs):
        for f in ("dob", "date_of_joining", "exit_date"):
            if attrs.get(f) == "":
                attrs[f] = None
        return attrs
