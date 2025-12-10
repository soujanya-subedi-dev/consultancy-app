from django.contrib import admin
from .models import Consultancy,Course, User

admin.site.register(Consultancy)
admin.site.register(Course)
admin.site.register(User)