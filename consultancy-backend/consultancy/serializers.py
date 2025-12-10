# serializers.py
from rest_framework import serializers
from .models import Consultancy, Course, User


class CourseSerializer(serializers.ModelSerializer):
    consultancy_name = serializers.CharField(source='consultancy.name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'tags', 'consultancy', 'consultancy_name']
        extra_kwargs = {
            'consultancy': {'required': False}
        }


class ConsultancySerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_admin = serializers.SerializerMethodField()
    is_consultancy = serializers.SerializerMethodField()
    
    def get_is_admin(self, obj):
        return obj.user.is_staff
    
    def get_is_consultancy(self, obj):
        return obj.user.is_consultancy
    
    class Meta:
        model = Consultancy
        fields = [
            'id', 'name', 'address', 'description', 'profile_image', 
            'phone_no', 'email', 'website', 'countries_operated', 
            'is_verified', 'courses', 'is_admin', 'is_consultancy'
        ]
        extra_kwargs = {
            'profile_image': {'required': False, 'allow_null': True}
        }


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_consultancy', 'is_staff', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance