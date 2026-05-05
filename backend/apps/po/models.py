from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

PO_STATUS_CHOICES    = [("active","Active"),("expired","Expired"),("pending","Pending"),("cancelled","Cancelled")]
INVOICE_STATUS_CHOICES=[("active","Active"),("expired","Expired"),("pending","Pending")]
BILLING_TYPE_CHOICES = [("hourly","Hourly"),("fixed","Fixed"),("monthly","Monthly")]
PAY_TYPE_CHOICES     = [("w2","W2"),("c2c","C2C"),("na","NA")]
WORK_MODE_CHOICES    = [("remote","Remote"),("onsite","Onsite"),("hybrid","Hybrid")]
CUSTOMER_TYPE_CHOICES= [
    ("investment_firm","Investment Firm"),("medical_insurance","Medical Insurance"),
    ("pharma","Pharma"),("technology","Technology"),("finance","Finance"),
    ("retail","Retail"),("other","Other"),
]


class PurchaseOrder(models.Model):
    # ── Admin / Tracking ──────────────────────────────────────────
    po_remarks          = models.CharField(max_length=200, blank=True, verbose_name="PO Remarks")
    comments            = models.TextField(blank=True, verbose_name="Comments")
    sorting             = models.CharField(max_length=200, blank=True, verbose_name="Sorting")
    company             = models.CharField(max_length=100, blank=True, verbose_name="Company (CBC)")
    entry_date          = models.DateField(null=True, blank=True, verbose_name="Entry Date")
    country             = models.CharField(max_length=50, blank=True, default="USA")
    record_created_by   = models.CharField(max_length=150, blank=True, verbose_name="Record Created By")
    msa_po_signed_by    = models.CharField(max_length=150, blank=True, verbose_name="MSA/PO Signed By")
    remarks             = models.TextField(blank=True, verbose_name="Remarks")

    # ── Candidate Info ────────────────────────────────────────────
    recruitment_manager      = models.CharField(max_length=150, blank=True)
    candidate_name           = models.CharField(max_length=200, verbose_name="Candidate Name")
    candidate_email          = models.EmailField(blank=True, verbose_name="Candidate Email ID")
    candidate_phone          = models.CharField(max_length=50, blank=True, verbose_name="Candidate Phone")
    candidate_pay_type       = models.CharField(max_length=10, choices=PAY_TYPE_CHOICES, blank=True)
    candidate_relationship_mgr= models.CharField(max_length=150, blank=True, verbose_name="Candidate Relationship Manager")
    candidate_visa           = models.CharField(max_length=20, blank=True, verbose_name="Candidate Visa")
    job_title                = models.CharField(max_length=150, blank=True)

    # ── Invoice Details ───────────────────────────────────────────
    invoice_start_month = models.CharField(max_length=20, blank=True, verbose_name="Invoice Start Month")
    invoice_start_dt    = models.DateField(null=True, blank=True, verbose_name="Invoice Start DT")
    active_invoice_begin= models.DateField(null=True, blank=True, verbose_name="Active Invoice Begin Date")
    active_invoice_end  = models.DateField(null=True, blank=True, verbose_name="Active Invoice End Date")
    invoice_status      = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default="active", verbose_name="Invoice Status")
    invoice_end_dt      = models.DateField(null=True, blank=True, verbose_name="Invoice End DT")
    invoice_schedule    = models.CharField(max_length=50, blank=True, verbose_name="Invoice Schedule")
    invoice_email       = models.EmailField(blank=True, verbose_name="Invoice Email ID")

    # ── PO Details ────────────────────────────────────────────────
    po_status           = models.CharField(max_length=20, choices=PO_STATUS_CHOICES, default="active", verbose_name="PO Status")
    po_end_date         = models.DateField(null=True, blank=True, verbose_name="PO End Date")
    po_comments         = models.TextField(blank=True, verbose_name="PO Comments")
    contract_info_path  = models.TextField(blank=True, verbose_name="Contract Information Path")

    # ── Billing ───────────────────────────────────────────────────
    billing_type        = models.CharField(max_length=20, choices=BILLING_TYPE_CHOICES, blank=True)
    bill_rate           = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Bill Rate")
    candidate_payrate   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Candidate Payrate (if hourly)")
    referral_rate       = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    net_payment_terms   = models.IntegerField(null=True, blank=True, verbose_name="Net Payment Terms (days)")

    # ── Client Chain ──────────────────────────────────────────────
    billable_client_name    = models.CharField(max_length=200, blank=True, verbose_name="Billable Client Name")
    billable_client_person  = models.CharField(max_length=150, blank=True, verbose_name="Billable Client Person Name")
    billable_client_email   = models.EmailField(blank=True, verbose_name="Billable Client Person Email")
    billable_client_phone   = models.CharField(max_length=30, blank=True, verbose_name="Billable Client Person Phone")
    billable_client_address = models.TextField(blank=True, verbose_name="Billable Client Address")
    supplier_name           = models.CharField(max_length=200, blank=True, verbose_name="Supplier Name")
    second_customer         = models.CharField(max_length=200, blank=True, verbose_name="2nd Customer Staffing Company")
    system_integrator       = models.CharField(max_length=200, blank=True, verbose_name="System Integrator Name")
    end_client_name         = models.CharField(max_length=200, blank=True, verbose_name="End Client Name")
    end_client_person       = models.CharField(max_length=150, blank=True, verbose_name="End Client Person Name")
    end_client_email        = models.EmailField(blank=True, verbose_name="End Client Person Email")
    end_client_phone        = models.CharField(max_length=30, blank=True, verbose_name="End Client Person Phone")
    customer_type           = models.CharField(max_length=30, choices=CUSTOMER_TYPE_CHOICES, blank=True)
    first_customer          = models.CharField(max_length=200, blank=True, verbose_name="First Customer")

    # ── Work Location ─────────────────────────────────────────────
    work_location_type      = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, blank=True)
    work_location_state     = models.CharField(max_length=100, blank=True)
    work_location_address   = models.TextField(blank=True)

    # ── Audit ─────────────────────────────────────────────────────
    created_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="pos_created")
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ["-entry_date", "-created_at"]
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"

    def __str__(self):
        return f"{self.candidate_name} — {self.billable_client_name} ({self.po_status})"
