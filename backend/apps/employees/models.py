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

# ── Location choices — US States + Global Countries ───────────────────────────
LOCATION_CHOICES = [
    # US States
    ("Alabama", "Alabama"), ("Alaska", "Alaska"), ("Arizona", "Arizona"),
    ("Arkansas", "Arkansas"), ("California", "California"), ("Colorado", "Colorado"),
    ("Connecticut", "Connecticut"), ("Delaware", "Delaware"), ("Florida", "Florida"),
    ("Georgia", "Georgia"), ("Hawaii", "Hawaii"), ("Idaho", "Idaho"),
    ("Illinois", "Illinois"), ("Indiana", "Indiana"), ("Iowa", "Iowa"),
    ("Kansas", "Kansas"), ("Kentucky", "Kentucky"), ("Louisiana", "Louisiana"),
    ("Maine", "Maine"), ("Maryland", "Maryland"), ("Massachusetts", "Massachusetts"),
    ("Michigan", "Michigan"), ("Minnesota", "Minnesota"), ("Mississippi", "Mississippi"),
    ("Missouri", "Missouri"), ("Montana", "Montana"), ("Nebraska", "Nebraska"),
    ("Nevada", "Nevada"), ("New Hampshire", "New Hampshire"), ("New Jersey", "New Jersey"),
    ("New Mexico", "New Mexico"), ("New York", "New York"),
    ("North Carolina", "North Carolina"), ("North Dakota", "North Dakota"),
    ("Ohio", "Ohio"), ("Oklahoma", "Oklahoma"), ("Oregon", "Oregon"),
    ("Pennsylvania", "Pennsylvania"), ("Rhode Island", "Rhode Island"),
    ("South Carolina", "South Carolina"), ("South Dakota", "South Dakota"),
    ("Tennessee", "Tennessee"), ("Texas", "Texas"), ("Utah", "Utah"),
    ("Vermont", "Vermont"), ("Virginia", "Virginia"), ("Washington", "Washington"),
    ("Washington D.C.", "Washington D.C."), ("West Virginia", "West Virginia"),
    ("Wisconsin", "Wisconsin"), ("Wyoming", "Wyoming"),
    ("Puerto Rico", "Puerto Rico"), ("Guam", "Guam"),
    # Countries
    ("Afghanistan", "Afghanistan"), ("Albania", "Albania"), ("Algeria", "Algeria"),
    ("Argentina", "Argentina"), ("Armenia", "Armenia"), ("Australia", "Australia"),
    ("Austria", "Austria"), ("Azerbaijan", "Azerbaijan"), ("Bahrain", "Bahrain"),
    ("Bangladesh", "Bangladesh"), ("Belarus", "Belarus"), ("Belgium", "Belgium"),
    ("Bolivia", "Bolivia"), ("Brazil", "Brazil"), ("Bulgaria", "Bulgaria"),
    ("Cambodia", "Cambodia"), ("Canada", "Canada"), ("Chile", "Chile"),
    ("China", "China"), ("Colombia", "Colombia"), ("Croatia", "Croatia"),
    ("Czech Republic", "Czech Republic"), ("Denmark", "Denmark"),
    ("Ecuador", "Ecuador"), ("Egypt", "Egypt"), ("Estonia", "Estonia"),
    ("Ethiopia", "Ethiopia"), ("Finland", "Finland"), ("France", "France"),
    ("Germany", "Germany"), ("Ghana", "Ghana"), ("Greece", "Greece"),
    ("Guatemala", "Guatemala"), ("Honduras", "Honduras"), ("Hong Kong", "Hong Kong"),
    ("Hungary", "Hungary"), ("India", "India"), ("Indonesia", "Indonesia"),
    ("Iran", "Iran"), ("Iraq", "Iraq"), ("Ireland", "Ireland"),
    ("Israel", "Israel"), ("Italy", "Italy"), ("Japan", "Japan"),
    ("Jordan", "Jordan"), ("Kazakhstan", "Kazakhstan"), ("Kenya", "Kenya"),
    ("Kuwait", "Kuwait"), ("Latvia", "Latvia"), ("Lebanon", "Lebanon"),
    ("Libya", "Libya"), ("Lithuania", "Lithuania"), ("Malaysia", "Malaysia"),
    ("Mexico", "Mexico"), ("Morocco", "Morocco"), ("Myanmar", "Myanmar"),
    ("Nepal", "Nepal"), ("Netherlands", "Netherlands"), ("New Zealand", "New Zealand"),
    ("Nigeria", "Nigeria"), ("Norway", "Norway"), ("Oman", "Oman"),
    ("Pakistan", "Pakistan"), ("Panama", "Panama"), ("Peru", "Peru"),
    ("Philippines", "Philippines"), ("Poland", "Poland"), ("Portugal", "Portugal"),
    ("Qatar", "Qatar"), ("Romania", "Romania"), ("Russia", "Russia"),
    ("Saudi Arabia", "Saudi Arabia"), ("Serbia", "Serbia"), ("Singapore", "Singapore"),
    ("Slovakia", "Slovakia"), ("Slovenia", "Slovenia"), ("South Africa", "South Africa"),
    ("South Korea", "South Korea"), ("Spain", "Spain"), ("Sri Lanka", "Sri Lanka"),
    ("Sweden", "Sweden"), ("Switzerland", "Switzerland"), ("Syria", "Syria"),
    ("Taiwan", "Taiwan"), ("Thailand", "Thailand"), ("Tunisia", "Tunisia"),
    ("Turkey", "Turkey"), ("UAE", "UAE"), ("Ukraine", "Ukraine"),
    ("United Kingdom", "United Kingdom"), ("United States", "United States"),
    ("Uruguay", "Uruguay"), ("Uzbekistan", "Uzbekistan"), ("Venezuela", "Venezuela"),
    ("Vietnam", "Vietnam"), ("Yemen", "Yemen"), ("Zimbabwe", "Zimbabwe"),
    ("Other", "Other"),
]

# ── Designation choices — All departments ─────────────────────────────────────
DESIGNATION_CHOICES = [
    # IT / Engineering
    ("Software Engineer", "Software Engineer"),
    ("Senior Software Engineer", "Senior Software Engineer"),
    ("Lead Software Engineer", "Lead Software Engineer"),
    ("Principal Software Engineer", "Principal Software Engineer"),
    ("Staff Software Engineer", "Staff Software Engineer"),
    ("Frontend Developer", "Frontend Developer"),
    ("Backend Developer", "Backend Developer"),
    ("Full Stack Developer", "Full Stack Developer"),
    ("Mobile Developer", "Mobile Developer"),
    ("iOS Developer", "iOS Developer"),
    ("Android Developer", "Android Developer"),
    ("DevOps Engineer", "DevOps Engineer"),
    ("Cloud Engineer", "Cloud Engineer"),
    ("Site Reliability Engineer (SRE)", "Site Reliability Engineer (SRE)"),
    ("Infrastructure Engineer", "Infrastructure Engineer"),
    ("Network Engineer", "Network Engineer"),
    ("Security Engineer", "Security Engineer"),
    ("Database Administrator (DBA)", "Database Administrator (DBA)"),
    ("System Administrator", "System Administrator"),
    ("IT Support Specialist", "IT Support Specialist"),
    ("IT Manager", "IT Manager"),
    ("Data Engineer", "Data Engineer"),
    ("Data Scientist", "Data Scientist"),
    ("Machine Learning Engineer", "Machine Learning Engineer"),
    ("AI/ML Engineer", "AI/ML Engineer"),
    ("BI Developer", "BI Developer"),
    ("QA Engineer", "QA Engineer"),
    ("Senior QA Engineer", "Senior QA Engineer"),
    ("QA Lead", "QA Lead"),
    ("Automation Engineer (SDET)", "Automation Engineer (SDET)"),
    ("Solutions Architect", "Solutions Architect"),
    ("Enterprise Architect", "Enterprise Architect"),
    ("Cloud Architect", "Cloud Architect"),
    ("Technical Lead", "Technical Lead"),
    ("Engineering Manager", "Engineering Manager"),
    ("VP of Engineering", "VP of Engineering"),
    ("Chief Technology Officer (CTO)", "Chief Technology Officer (CTO)"),
    ("UI/UX Designer", "UI/UX Designer"),
    ("Product Designer", "Product Designer"),
    # Project / Program Management
    ("Project Manager", "Project Manager"),
    ("Senior Project Manager", "Senior Project Manager"),
    ("Program Manager", "Program Manager"),
    ("Portfolio Manager", "Portfolio Manager"),
    ("Delivery Manager", "Delivery Manager"),
    ("Scrum Master", "Scrum Master"),
    ("Agile Coach", "Agile Coach"),
    ("Product Owner", "Product Owner"),
    # Business Analysis / Consulting
    ("Business Analyst", "Business Analyst"),
    ("Senior Business Analyst", "Senior Business Analyst"),
    ("Functional Consultant", "Functional Consultant"),
    ("ERP Consultant", "ERP Consultant"),
    ("SAP Consultant", "SAP Consultant"),
    ("Salesforce Consultant", "Salesforce Consultant"),
    # Product Management
    ("Product Manager", "Product Manager"),
    ("Senior Product Manager", "Senior Product Manager"),
    # HR Department
    ("HR Executive", "HR Executive"),
    ("HR Specialist", "HR Specialist"),
    ("HR Generalist", "HR Generalist"),
    ("HR Manager", "HR Manager"),
    ("Senior HR Manager", "Senior HR Manager"),
    ("Talent Acquisition Specialist", "Talent Acquisition Specialist"),
    ("Recruiter", "Recruiter"),
    ("Senior Recruiter", "Senior Recruiter"),
    ("Technical Recruiter", "Technical Recruiter"),
    ("HR Business Partner", "HR Business Partner"),
    ("Compensation & Benefits Specialist", "Compensation & Benefits Specialist"),
    ("Learning & Development Specialist", "Learning & Development Specialist"),
    ("HR Director", "HR Director"),
    ("VP of Human Resources", "VP of Human Resources"),
    ("Chief People Officer (CPO)", "Chief People Officer (CPO)"),
    ("Payroll Specialist", "Payroll Specialist"),
    ("Payroll Manager", "Payroll Manager"),
    ("HRIS Analyst", "HRIS Analyst"),
    # Finance & Accounting
    ("Financial Analyst", "Financial Analyst"),
    ("Senior Financial Analyst", "Senior Financial Analyst"),
    ("Accountant", "Accountant"),
    ("Senior Accountant", "Senior Accountant"),
    ("Finance Manager", "Finance Manager"),
    ("Controller", "Controller"),
    ("Chief Financial Officer (CFO)", "Chief Financial Officer (CFO)"),
    # Sales & Business Development
    ("Sales Executive", "Sales Executive"),
    ("Business Development Manager", "Business Development Manager"),
    ("Account Manager", "Account Manager"),
    ("Key Account Manager", "Key Account Manager"),
    ("Account Executive", "Account Executive"),
    ("Sales Manager", "Sales Manager"),
    ("VP of Sales", "VP of Sales"),
    # Marketing
    ("Marketing Specialist", "Marketing Specialist"),
    ("Digital Marketing Manager", "Digital Marketing Manager"),
    ("Content Manager", "Content Manager"),
    ("Marketing Director", "Marketing Director"),
    ("VP of Marketing", "VP of Marketing"),
    # Operations & Leadership
    ("Operations Manager", "Operations Manager"),
    ("Director of Operations", "Director of Operations"),
    ("VP of Operations", "VP of Operations"),
    ("Chief Operating Officer (COO)", "Chief Operating Officer (COO)"),
    ("Chief Executive Officer (CEO)", "Chief Executive Officer (CEO)"),
    ("General Manager", "General Manager"),
    ("Director", "Director"),
    ("Senior Director", "Senior Director"),
    ("Vice President (VP)", "Vice President (VP)"),
    ("Senior Vice President (SVP)", "Senior Vice President (SVP)"),
    # Admin & Legal
    ("Administrative Assistant", "Administrative Assistant"),
    ("Executive Assistant", "Executive Assistant"),
    ("Office Manager", "Office Manager"),
    ("Legal Counsel", "Legal Counsel"),
    ("Compliance Officer", "Compliance Officer"),
    ("Contracts Manager", "Contracts Manager"),
    # General
    ("Trainee / Intern", "Trainee / Intern"),
    ("Associate Consultant", "Associate Consultant"),
    ("Consultant", "Consultant"),
    ("Senior Consultant", "Senior Consultant"),
    ("Principal Consultant", "Principal Consultant"),
    ("Managing Consultant", "Managing Consultant"),
    ("Other", "Other"),
]


class Employee(models.Model):

    # ── Identity ──────────────────────────────────────────────────
    first_name        = models.CharField(max_length=100, verbose_name="First Name")
    middle_name       = models.CharField(max_length=100, blank=True, verbose_name="Middle Name")
    last_name         = models.CharField(max_length=100, verbose_name="Last Name")
    emp_no            = models.CharField(max_length=50, unique=True, verbose_name="Emp No")
    gender            = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Gender")
    dob               = models.DateField(verbose_name="DOB")
    retirement_dob    = models.DateField(null=True, blank=True, verbose_name="Rehire DOJ")
    contact_number    = models.CharField(max_length=20, verbose_name="Contact Number")
    official_email    = models.EmailField(verbose_name="Official Mail ID")
    personal_email    = models.EmailField(verbose_name="Personal Email ID")
    address           = models.TextField(verbose_name="Address")
    worksite_address  = models.TextField(verbose_name="Worksite Address / Location 1")

    # ── Employment ────────────────────────────────────────────────
    status            = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active", verbose_name="Status")
    employment_type   = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, verbose_name="Employment Type")
    date_of_joining   = models.DateField(null=True, blank=True, verbose_name="DOJ")
    exit_date         = models.DateField(null=True, blank=True, verbose_name="Exit Date")
    employer          = models.CharField(max_length=150, default="CBC Labs", verbose_name="Employer")
    client            = models.CharField(max_length=150, blank=True, verbose_name="Client")
    customer          = models.CharField(max_length=150, blank=True, verbose_name="Customer")
    designation       = models.CharField(max_length=200, blank=True, choices=DESIGNATION_CHOICES, verbose_name="Designation")
    primary_skills    = models.TextField(blank=True, verbose_name="Primary Skills")
    secondary_skills  = models.TextField(blank=True, verbose_name="Secondary Skills")
    location          = models.CharField(max_length=200, choices=LOCATION_CHOICES, verbose_name="Location")

    # ── Visa & Compliance ─────────────────────────────────────────
    visa_type         = models.CharField(max_length=10, choices=VISA_TYPE_CHOICES, verbose_name="Visa Type")
    id_status         = models.CharField(max_length=20, choices=ID_STATUS_CHOICES, verbose_name="ID Status")
    e_verify_status   = models.CharField(max_length=20, choices=E_VERIFY_CHOICES, verbose_name="E-Verify Status")

    # ── Audit ──────────────────────────────────────────────────────
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="employees_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="employees_updated")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # History triggered when client, customer, or status changes
    HISTORY_FIELDS = ["client", "customer", "status"]

    class Meta:
        ordering     = ["last_name", "first_name"]
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    @property
    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return " ".join(p for p in parts if p).strip()

    def __str__(self):
        return f"{self.full_name} ({self.emp_no})"

    def save_history_snapshot(self, changed_by=None):
        EmploymentHistory.objects.create(
            employee         = self,
            employer         = self.employer,
            client           = self.client,
            customer         = self.customer,
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
    client           = models.CharField(max_length=150, blank=True)
    customer         = models.CharField(max_length=150, blank=True)
    designation      = models.CharField(max_length=200, blank=True)
    employment_type  = models.CharField(max_length=20,  blank=True)
    location         = models.CharField(max_length=200, blank=True)
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
        return f"{self.employee.full_name} — {self.client or self.employer or '—'} ({self.recorded_at.strftime('%Y-%m-%d')})"
