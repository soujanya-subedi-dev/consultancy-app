# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    is_consultancy = models.BooleanField(default=False)


class Consultancy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='consultancy')
    name = models.CharField(max_length=100)
    address = models.TextField()
    description = models.TextField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='logos/', null=True, blank=True)
    phone_no = models.CharField(max_length=20, null=True, blank=True)  # Changed from phone_numbers
    website = models.URLField(null=True, blank=True)
    countries_operated = models.JSONField(default=list, blank=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Consultancies"

    def __str__(self):
        return self.name


class Course(models.Model):
    consultancy = models.ForeignKey(
        Consultancy, related_name='courses', on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    tags = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.name} ({self.consultancy.name})"