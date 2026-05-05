from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

STATUS_CHOICES = [
    ("active", "Active"),
    ("exited", "Exited"),
    ("bench",  "Bench"),
]

EMPLOYMENT_TYPE_CHOICES = [
    ("w2",       "W2"),
    ("c2c",      "C2C"),
    ("1099",     "1099"),
    ("fulltime", "Full Time"),
]

GENDER_CHOICES = [
    ("M", "Male"),
    ("F", "Female"),
    ("O", "Other"),
]

VISA_TYPE_CHOICES = [
    ("GC",    "Green Card"),
    ("USC",   "US Citizen"),
    ("H1B",   "H1B"),
    ("L1",    "L1"),
    ("OPT",   "OPT"),
    ("CPT",   "CPT"),
    ("TN",    "TN"),
    ("other", "Other"),
]

ID_STATUS_CHOICES = [
    ("compliant", "Compliant"),
    ("pending",   "Pending"),
    ("expired",   "Expired"),
    ("na",        "N/A"),
]

E_VERIFY_CHOICES = [
    ("compliant", "Compliant"),
    ("applied",   "Applied"),
    ("pending",   "Pending"),
    ("na",        "N/A"),
]


class Employee(models.Model):

    # ── Identity ──────────────────────────────────────────────────
    # 1 — Required
    adf_employee_name = models.CharField(max_length=200, verbose_name="ADP Employee Name")
    # 2 — Required
    emp_no            = models.CharField(max_length=50, unique=True, verbose_name="Emp No")
    # 3 — Required
    gender            = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Gender")
    # 4 — Required
    dob               = models.DateField(verbose_name="DOB")
    # 5 — NOT required
    retirement_dob    = models.DateField(null=True, blank=True, verbose_name="Rehire DOJ")
    # 6 — Required
    contact_number    = models.CharField(max_length=20, verbose_name="Contact Number")
    # 7 — Required
    official_email    = models.EmailField(verbose_name="Official Mail ID")
    # 8 — Required
    personal_email    = models.EmailField(verbose_name="Personal Email ID")
    # 9 — Required
    address           = models.TextField(verbose_name="Address")
    # 10 — Required
    worksite_address  = models.TextField(verbose_name="Worksite Address / Location 1")

    # ── Employment ────────────────────────────────────────────────
    # 11 — Required
    status            = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active", verbose_name="Status")
    # 12 — Required
    employment_type   = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, verbose_name="Employment Type")
    # 13 — NOT required
    date_of_joining   = models.DateField(null=True, blank=True, verbose_name="DOJ")
    # 14 — NOT required
    exit_date         = models.DateField(null=True, blank=True, verbose_name="Exit Date")
    # 15 — NOT required
    employer          = models.CharField(max_length=150, blank=True, verbose_name="Employer")
    # 16 — NOT required
    designation       = models.CharField(max_length=150, blank=True, verbose_name="Designation")
    # 17 — NOT required
    primary_skills    = models.TextField(blank=True, verbose_name="Primary Skills")
    # 18 — NOT required
    secondary_skills  = models.TextField(blank=True, verbose_name="Secondary Skills")
    # 19 — Required
    location          = models.CharField(max_length=150, verbose_name="Location")

    # ── Visa & Compliance ─────────────────────────────────────────
    # 20 — Required
    visa_type         = models.CharField(max_length=10, choices=VISA_TYPE_CHOICES, verbose_name="Visa Type")
    # 21 — Required (N/A option included)
    id_status         = models.CharField(max_length=20, choices=ID_STATUS_CHOICES, verbose_name="ID Status")
    # 22 — Required (N/A option included)
    e_verify_status   = models.CharField(max_length=20, choices=E_VERIFY_CHOICES, verbose_name="E-Verify Status")

    # ── Audit ──────────────────────────────────────────────────────
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="employees_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="employees_updated")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # History triggers ONLY when employer (client) or status changes
    HISTORY_FIELDS = [
        "employer",  # client company changed
        "status",    # active → bench → active
    ]

    class Meta:
        ordering     = ["adf_employee_name"]
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    def __str__(self):
        return f"{self.adf_employee_name} ({self.emp_no})"

    def save_history_snapshot(self, changed_by=None):
        """
        Saves a history record ONLY when client/project fields change.
        Personal info updates (email, phone, skills, visa etc.) do NOT trigger this.
        """
        EmploymentHistory.objects.create(
            employee         = self,
            employer         = self.employer,
            designation      = self.designation,
            employment_type  = self.employment_type,
            location         = self.location,
            worksite_address = self.worksite_address,
            status           = self.status,
            date_of_joining  = self.date_of_joining,
            exit_date        = self.exit_date,
            primary_skills   = self.primary_skills,
            secondary_skills = self.secondary_skills,
            visa_type        = self.visa_type,
            id_status        = self.id_status,
            e_verify_status  = self.e_verify_status,
            recorded_by      = changed_by,
        )


class EmploymentHistory(models.Model):
    employee         = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="employment_history")
    employer         = models.CharField(max_length=150, blank=True)
    designation      = models.CharField(max_length=150, blank=True)
    employment_type  = models.CharField(max_length=20,  blank=True)
    location         = models.CharField(max_length=150, blank=True)
    worksite_address = models.TextField(blank=True)
    status           = models.CharField(max_length=10,  blank=True)
    date_of_joining  = models.DateField(null=True, blank=True)
    exit_date        = models.DateField(null=True, blank=True)
    primary_skills   = models.TextField(blank=True)
    secondary_skills = models.TextField(blank=True)
    visa_type        = models.CharField(max_length=10,  blank=True)
    id_status        = models.CharField(max_length=20,  blank=True)
    e_verify_status  = models.CharField(max_length=20,  blank=True)
    recorded_at      = models.DateTimeField(auto_now_add=True)
    recorded_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="history_recorded")

    class Meta:
        ordering     = ["-recorded_at"]
        verbose_name = "Employment History"
        verbose_name_plural = "Employment Histories"

    def __str__(self):
        return f"{self.employee.adf_employee_name} — {self.employer or '—'} ({self.recorded_at.strftime('%Y-%m-%d')})"
