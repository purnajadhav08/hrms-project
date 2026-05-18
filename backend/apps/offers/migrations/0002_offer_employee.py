from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("employees", "0004_alter_employee_options_alter_employee_first_name_and_more"),
        ("offers", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="offer",
            name="employee",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="offers",
                to="employees.employee",
            ),
        ),
    ]
