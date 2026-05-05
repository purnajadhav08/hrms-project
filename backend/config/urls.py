from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/",         admin.site.urls),
    path("api/",           include("apps.accounts.urls")),
    path("api/employees/", include("apps.employees.urls")),
    path("api/offers/",    include("apps.offers.urls")),
    path("api/po/",        include("apps.po.urls")),
]
