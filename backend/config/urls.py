from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/",         admin.site.urls),
    path("api/",           include("apps.accounts.urls")),
    path("api/employees/", include("apps.employees.urls")),
    path("api/offers/",    include("apps.offers.urls")),
    path("api/po/",        include("apps.po.urls")),
    path("api/msa/",       include("apps.msa.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
