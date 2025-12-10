# serializers.py
from rest_framework import serializers
from .models import Consultancy, Course, User
from django.contrib.auth import get_user_model

class CourseSerializer(serializers.ModelSerializer):
    consultancy_name = serializers.CharField(source='consultancy.name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'tags', 'consultancy', 'consultancy_name']

class ConsultancySerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_admin = serializers.SerializerMethodField()
    is_consultancy = serializers.SerializerMethodField()
    
    def get_is_admin(self, obj):
        return obj.user.is_staff  # or obj.user.is_admin if you add that field
    
    def get_is_consultancy(self, obj):
        return obj.user.is_consultancy
    
    class Meta:
        model = Consultancy
        fields = ['id', 'name', 'address', 'description', 'profile_image', 'phone_numbers', 
                    'email', 'website', 'countries_operated', 'is_verified', 'courses', 
                    'is_admin', 'is_consultancy']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'is_consultancy', 'is_staff' ,'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
