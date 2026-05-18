from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

OFFER_STATUS_CHOICES = [
    ("pending",  "Pending"),
    ("accepted", "Accepted"),
    ("rejected", "Rejected"),
    ("no_show",  "No Show"),
    ("withdrawn","Withdrawn"),
]

OFFER_TYPE_CHOICES = [
    ("w2",     "W2"),
    ("c2c",    "C2C"),
    ("intern", "Intern"),
    ("na",     "NA"),
]

EMPLOYMENT_TYPE_CHOICES = [
    ("fulltime",  "Full-Time"),
    ("contract",  "Contract"),
    ("parttime",  "Part-Time"),
    ("intern",    "Internship"),
]

VISA_TYPE_CHOICES = [
    ("H1B","H1B"),("GC","Green Card"),("USC","US Citizen"),
    ("OPT","OPT"),("CPT","CPT"),("L1","L1"),("TN","TN"),
    ("F1","F1"),("other","Other"),
]

WORK_MODE_CHOICES = [
    ("remote", "Remote"),
    ("onsite", "Onsite"),
    ("hybrid", "Hybrid"),
]

RATE_TYPE_CHOICES = [
    ("annual", "Annual"),
    ("hourly", "Hourly"),
]


class Offer(models.Model):
    # ── Candidate Identity ────────────────────────────────────────
    candidate_id        = models.CharField(max_length=50, unique=True, verbose_name="Candidate ID")
    candidate_full_name = models.CharField(max_length=200, verbose_name="Candidate Full Name")
    gender              = models.CharField(max_length=10, blank=True)
    contact_number      = models.CharField(max_length=20, blank=True)
    personal_email      = models.EmailField(verbose_name="Personal Email ID")

    # ── Location ──────────────────────────────────────────────────
    current_location    = models.CharField(max_length=150, blank=True)
    preferred_work_location = models.CharField(max_length=150, blank=True)

    # ── Offer Details ─────────────────────────────────────────────
    offer_released_date = models.DateField(null=True, blank=True)
    offer_type          = models.CharField(max_length=20, choices=OFFER_TYPE_CHOICES, blank=True)
    employment_type     = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, blank=True)
    visa_type           = models.CharField(max_length=10, choices=VISA_TYPE_CHOICES, blank=True)
    offer_status        = models.CharField(max_length=20, choices=OFFER_STATUS_CHOICES, default="pending")
    no_show_reason      = models.TextField(blank=True)
    hr_remarks          = models.TextField(blank=True)

    # ── Job Details ───────────────────────────────────────────────
    job_title           = models.CharField(max_length=150, blank=True)
    technology          = models.CharField(max_length=150, blank=True)
    work_mode           = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, blank=True)
    rate_type           = models.CharField(max_length=20, choices=RATE_TYPE_CHOICES, blank=True)
    salary_pay_rate     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    date_of_joining     = models.DateField(null=True, blank=True, verbose_name="DOJ")

    # ── Team ──────────────────────────────────────────────────────
    recruiter_name      = models.CharField(max_length=150, blank=True)
    account_manager     = models.CharField(max_length=150, blank=True)

    # ── HR Employee Link ──────────────────────────────────────────
    employee    = models.ForeignKey(
        "employees.Employee", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="offers"
    )

    # ── Audit ─────────────────────────────────────────────────────
    created_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="offers_created")
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Offer"
        verbose_name_plural = "Offers"

    def __str__(self):
        return f"{self.candidate_full_name} ({self.candidate_id}) — {self.offer_status}"
