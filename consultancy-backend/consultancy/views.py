# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Consultancy, Course
from .serializers import ConsultancySerializer, CourseSerializer, UserSerializer
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token

User = get_user_model()


# ----------------- Consultancy Registration / Login -----------------
@api_view(['POST'])
def register_consultancy(request):
    data = request.data

    if User.objects.filter(username=data['username']).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    user = User.objects.create_user(
        username=data.get('username'),
        email=data.get('email'),
        password=data.get('password'),
        is_consultancy=True
    )

    consultancy = Consultancy.objects.create(
        user=user,
        name=data.get('name'),
        address=data.get('address')
    )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({'token': token.key, 'consultancy_id': consultancy.id})


@api_view(['POST'])
def login_consultancy(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )
    
    if not user:
        return Response({'error': 'Invalid credentials'}, status=400)
    
    # Allow both admin and consultancy users to login
    if not (user.is_staff or user.is_consultancy):
        return Response({'error': 'Invalid account type'}, status=403)
    
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})
    


# ----------------- Consultancy Profile -----------------
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def consultancy_profile(request):
    if request.method == 'DELETE':
        # Delete consultancy account
        consultancy = Consultancy.objects.get(user=request.user)
        request.user.delete()  # This will cascade delete consultancy too
        return Response({'success': 'Account deleted'})
    
    # For admin users, they might not have a consultancy
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=400)
    
    consultancy = request.user.consultancy

    if request.method == 'GET':
        serializer = ConsultancySerializer(consultancy)
        return Response(serializer.data)
    
    serializer = ConsultancySerializer(consultancy, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# ----------------- Courses CRUD -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_course(request):
    """Link an existing course to the consultancy"""
    consultancy = Consultancy.objects.get(user=request.user)
    course_id = request.data.get('course_id')
    
    try:
        course = Course.objects.get(pk=course_id)
        # If course belongs to another consultancy, create a copy for this one
        # OR allow sharing - your choice
        # For now, assume 1 course per consultancy:
        if course.consultancy == consultancy:
            return Response({'error': 'Course already linked'}, status=400)
        
        # Create new course for this consultancy
        new_course = Course.objects.create(
            consultancy=consultancy,
            name=course.name,
            tags=course.tags
        )
        return Response(CourseSerializer(new_course).data)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlink_course(request):
    """Unlink a course from the consultancy"""
    consultancy = Consultancy.objects.get(user=request.user)
    course_id = request.data.get('course_id')
    
    try:
        course = Course.objects.get(pk=course_id, consultancy=consultancy)
        course.delete()
        return Response({'success': 'Course unlinked'})
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    
# ----------------- Courses CRUD -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course(request):
    consultancy = Consultancy.objects.get(user=request.user)
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(consultancy=consultancy)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_course(request, course_id):
    consultancy = Consultancy.objects.get(user=request.user)
    try:
        course = Course.objects.get(pk=course_id, consultancy=consultancy)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    
    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    consultancy = Consultancy.objects.get(user=request.user)
    try:
        course = Course.objects.get(pk=course_id, consultancy=consultancy)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    
    course.delete()
    return Response({'success': 'Course deleted'})



# ----------------- Public Search -----------------
@api_view(['GET'])
def search_consultancies(request):
    query = request.GET.get('query', '')
    country = request.GET.get('country', '')
    
    consultancies = Consultancy.objects.filter(is_verified=True)
    
    if country:
        consultancies = consultancies.filter(countries_operated__contains=[country])
    
    result = []
    for c in consultancies:
        for course in c.courses.all():
            if query.lower() in course.name.lower() or query.lower() in [tag.lower() for tag in course.tags]:
                result.append(c)
                break
    
    serializer = ConsultancySerializer(result, many=True)
    return Response(serializer.data)



# ----------------- Admin -----------------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_users(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
    if request.method == 'DELETE':
        user.delete()
        return Response({'success': 'User deleted'})
    
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_courses(request):
    if request.method == 'POST':
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_course_detail(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    
    if request.method == 'DELETE':
        course.delete()
        return Response({'success': 'Course deleted'})
    
    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_consultancy_detail(request, consultancy_id):
    try:
        consultancy = Consultancy.objects.get(pk=consultancy_id)
    except Consultancy.DoesNotExist:
        return Response({'error': 'Consultancy not found'}, status=404)
    
    if request.method == 'DELETE':
        consultancy.user.delete()  # Cascade deletes consultancy
        return Response({'success': 'Consultancy deleted'})
    
    if request.method == 'PUT':
        serializer = ConsultancySerializer(consultancy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_consultancies(request):
    consultancies = Consultancy.objects.all()
    serializer = ConsultancySerializer(consultancies, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def verify_consultancy(request, consultancy_id):
    try:
        consultancy = Consultancy.objects.get(pk=consultancy_id)
    except Consultancy.DoesNotExist:
        return Response({'error': 'Consultancy not found'}, status=404)
    
    consultancy.is_verified = True
    consultancy.save()
    return Response({'success': 'Consultancy verified'})
