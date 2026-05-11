from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import MSA
from .serializers import MSASerializer


class MSAViewSet(viewsets.ModelViewSet):
    queryset = MSA.objects.all()
    serializer_class = MSASerializer
    permission_classes = [IsAuthenticated]
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "msa_validity", "mutually_executed", "employee"]
    search_fields    = ["vendor_name", "client_name", "supplier_name", "fein_number"]
    ordering_fields  = ["created_at", "date_of_execution", "msa_end_date", "vendor_name"]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
