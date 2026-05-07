from django.db import migrations, models


def migrate_client_to_vendor(apps, schema_editor):
    Employee = apps.get_model("employees", "Employee")
    EmploymentHistory = apps.get_model("employees", "EmploymentHistory")
    for emp in Employee.objects.order_by("pk"):
        emp.vendor     = emp.client or ""
        emp.end_client = emp.customer or ""
        emp.save(update_fields=["vendor", "end_client"])
    for hist in EmploymentHistory.objects.order_by("pk"):
        hist.vendor     = hist.client or ""
        hist.end_client = hist.customer or ""
        hist.save(update_fields=["vendor", "end_client"])


class Migration(migrations.Migration):

    dependencies = [
        ("employees", "0002_name_split_client_customer_choices"),
    ]

    operations = [
        # Employee — add new fields
        migrations.AddField(
            model_name="employee",
            name="vendor",
            field=models.CharField(blank=True, max_length=150, verbose_name="Vendor"),
        ),
        migrations.AddField(
            model_name="employee",
            name="implementation_partners",
            field=models.JSONField(blank=True, default=list, verbose_name="Implementation Partners"),
        ),
        migrations.AddField(
            model_name="employee",
            name="end_client",
            field=models.CharField(blank=True, max_length=150, verbose_name="End Client"),
        ),
        # EmploymentHistory — add new fields
        migrations.AddField(
            model_name="employmenthistory",
            name="vendor",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="employmenthistory",
            name="implementation_partners",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="employmenthistory",
            name="end_client",
            field=models.CharField(blank=True, max_length=150),
        ),
        # Data migration — copy client → vendor, customer → end_client
        migrations.RunPython(migrate_client_to_vendor, migrations.RunPython.noop),
        # Remove old fields
        migrations.RemoveField(model_name="employee",         name="client"),
        migrations.RemoveField(model_name="employee",         name="customer"),
        migrations.RemoveField(model_name="employmenthistory", name="client"),
        migrations.RemoveField(model_name="employmenthistory", name="customer"),
    ]
