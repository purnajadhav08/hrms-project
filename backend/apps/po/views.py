from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import PurchaseOrder
from .serializers import POSerializer

class POViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = POSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["po_status","invoice_status","candidate_pay_type",
                       "work_location_type","customer_type","company","employee"]
    search_fields    = ["candidate_name","candidate_email","billable_client_name",
                       "end_client_name","job_title"]
    ordering_fields  = ["entry_date","created_at","candidate_name","po_end_date"]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
