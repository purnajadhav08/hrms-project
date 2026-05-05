from django.contrib import admin
from .models import Offer

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display  = ["candidate_id","candidate_full_name","offer_status","offer_type","visa_type","job_title","date_of_joining"]
    list_filter   = ["offer_status","offer_type","visa_type","work_mode"]
    search_fields = ["candidate_id","candidate_full_name","personal_email"]
