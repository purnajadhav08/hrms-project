import random
import string
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


COMPANY_DOMAIN = "cbcinc.ai"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_approved", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [("admin", "Admin"), ("hr", "HR")]

    # ── Core ──────────────────────────────────────────────────────
    email       = models.EmailField(unique=True)
    full_name   = models.CharField(max_length=200)
    role        = models.CharField(max_length=10, choices=ROLE_CHOICES, default="hr")
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    is_approved = models.BooleanField(
        default=False,
        help_text="Admins are auto-approved on signup. HRs require Admin approval."
    )
    date_joined = models.DateTimeField(auto_now_add=True)

    # ── Profile fields (editable by Admin) ────────────────────────
    emp_no           = models.CharField(max_length=50, unique=True, null=True, blank=True)
    gender           = models.CharField(max_length=1, blank=True,
                                        choices=[("M","Male"),("F","Female"),("O","Other")])
    dob              = models.DateField(null=True, blank=True)
    contact_number   = models.CharField(max_length=20, blank=True)
    personal_email   = models.EmailField(blank=True)
    official_email   = models.EmailField(blank=True)
    address          = models.TextField(blank=True)
    worksite_address = models.TextField(blank=True)
    account_status   = models.CharField(max_length=20, default="active",
                                        choices=[("active","Active"),("exited","Exited"),("bench","Bench")])
    employment_type  = models.CharField(max_length=20, blank=True,
                                        choices=[("w2","W2"),("c2c","C2C"),("1099","1099"),("fulltime","Full Time")])
    date_of_joining  = models.DateField(null=True, blank=True)
    exit_date        = models.DateField(null=True, blank=True)
    designation      = models.CharField(max_length=150, blank=True)
    employer         = models.CharField(max_length=150, blank=True)
    primary_skills   = models.TextField(blank=True)
    secondary_skills = models.TextField(blank=True)
    location         = models.CharField(max_length=150, blank=True)
    visa_type        = models.CharField(max_length=10, blank=True,
                                        choices=[("GC","Green Card"),("USC","US Citizen"),
                                                 ("H1B","H1B"),("L1","L1"),("OPT","OPT"),
                                                 ("CPT","CPT"),("TN","TN"),("other","Other")])
    id_status        = models.CharField(max_length=100, blank=True)
    e_verify_status  = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []
    objects         = UserManager()

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} <{self.email}> [{self.role}]"

    def save(self, *args, **kwargs):
        if self.role == "admin":
            self.is_approved = True
            self.is_staff    = True
        super().save(*args, **kwargs)


def _otp_expiry():
    return timezone.now() + timedelta(minutes=10)

def _generate_otp():
    return "".join(random.choices(string.digits, k=6))


class OTPToken(models.Model):
    """6-digit OTP for 2FA — expires in 10 minutes, single use."""
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otp_tokens")
    code       = models.CharField(max_length=6, default=_generate_otp)
    expires_at = models.DateTimeField(default=_otp_expiry)
    used       = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at

    def __str__(self):
        return f"OTP for {self.user.email} ({'used' if self.used else 'valid'})"
