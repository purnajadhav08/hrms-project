from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

MSA_STATUS_CHOICES = [
    ("active",   "Active"),
    ("inactive", "Inactive"),
]

MSA_VALIDITY_CHOICES = [
    ("long_term",  "Long Term"),
    ("short_term", "Short Term"),
    ("annual",     "Annual"),
    ("custom",     "Custom Dates"),
]


class MSA(models.Model):
    # ── Core ──────────────────────────────────────────────────────
    vendor_name       = models.CharField(max_length=200, verbose_name="Vendor Name")
    client_name       = models.CharField(max_length=200, blank=True, verbose_name="Client Name")
    supplier_name     = models.CharField(max_length=200, blank=True, verbose_name="Supplier Name")
    fein_number       = models.CharField(max_length=50,  blank=True, verbose_name="FEIN Number")
    vendor_address    = models.TextField(blank=True, verbose_name="Vendor Address")

    # ── Agreement ─────────────────────────────────────────────────
    mutually_executed = models.BooleanField(default=False, verbose_name="Mutually Executed")
    date_of_execution = models.DateField(null=True, blank=True, verbose_name="Date of Execution")
    msa_validity      = models.CharField(max_length=20, choices=MSA_VALIDITY_CHOICES, blank=True, verbose_name="MSA Validity")
    msa_start_date    = models.DateField(null=True, blank=True, verbose_name="MSA Start Date")
    msa_end_date      = models.DateField(null=True, blank=True, verbose_name="MSA End Date")
    poc_signatory     = models.CharField(max_length=150, blank=True, verbose_name="POC Name of Signatory")

    # ── Status & Notes ────────────────────────────────────────────
    status            = models.CharField(max_length=20, choices=MSA_STATUS_CHOICES, default="active")
    notes             = models.TextField(blank=True)

    # ── Document ──────────────────────────────────────────────────
    document          = models.FileField(upload_to="msa_docs/", null=True, blank=True, verbose_name="MSA Document")

    # ── Accounts POC ──────────────────────────────────────────────
    accounts_poc_name  = models.CharField(max_length=150, blank=True, verbose_name="Accounts POC Name")
    accounts_poc_email = models.EmailField(blank=True, verbose_name="Accounts POC Email")
    accounts_poc_phone = models.CharField(max_length=30,  blank=True, verbose_name="Accounts POC Phone")

    # ── Vendor POC 1 ──────────────────────────────────────────────
    vendor_poc1_name  = models.CharField(max_length=150, blank=True, verbose_name="Vendor POC 1 Name")
    vendor_poc1_email = models.EmailField(blank=True, verbose_name="Vendor POC 1 Email")
    vendor_poc1_phone = models.CharField(max_length=30,  blank=True, verbose_name="Vendor POC 1 Phone")

    # ── Vendor POC 2 ──────────────────────────────────────────────
    vendor_poc2_name  = models.CharField(max_length=150, blank=True, verbose_name="Vendor POC 2 Name")
    vendor_poc2_email = models.EmailField(blank=True, verbose_name="Vendor POC 2 Email")
    vendor_poc2_phone = models.CharField(max_length=30,  blank=True, verbose_name="Vendor POC 2 Phone")

    # ── Vendor POC 3 ──────────────────────────────────────────────
    vendor_poc3_name  = models.CharField(max_length=150, blank=True, verbose_name="Vendor POC 3 Name")
    vendor_poc3_email = models.EmailField(blank=True, verbose_name="Vendor POC 3 Email")
    vendor_poc3_phone = models.CharField(max_length=30,  blank=True, verbose_name="Vendor POC 3 Phone")

    # ── Audit ─────────────────────────────────────────────────────
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="msas_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ["-created_at"]
        verbose_name = "MSA"
        verbose_name_plural = "MSAs"

    def __str__(self):
        return f"{self.vendor_name} — {self.client_name} ({self.status})"
