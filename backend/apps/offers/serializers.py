from rest_framework import serializers
from .models import Offer

class OfferSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default="—")

    class Meta:
        model  = Offer
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "created_by_name"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["created_by"] = request.user if request else None
        return super().create(validated_data)
