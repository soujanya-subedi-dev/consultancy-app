from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register_consultancy),
    path('login/', views.login_consultancy),
    
    # Consultancy Profile
    path('profile/', views.consultancy_profile),
    
    # Consultancy Courses
    path('courses/add/', views.add_course),
    path('courses/edit/<int:course_id>/', views.edit_course),
    path('courses/delete/<int:course_id>/', views.delete_course),
    path('courses/link/', views.link_course),
    path('courses/unlink/', views.unlink_course),
    
    # Public Search
    path('search/', views.search_consultancies),
    
    # Admin - Consultancies
    path('admin/consultancies/', views.admin_list_consultancies),
    path('admin/consultancies/<int:consultancy_id>/', views.admin_consultancy_detail),
    path('admin/consultancies/verify/<int:consultancy_id>/', views.verify_consultancy),
    
    # Admin - Users
    path('admin/users/', views.admin_users),
    path('admin/users/<int:user_id>/', views.admin_user_detail),
    
    # Admin - Courses
    path('admin/courses/', views.admin_courses),
    path('admin/courses/<int:course_id>/', views.admin_course_detail),
]
