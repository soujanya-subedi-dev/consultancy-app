# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Consultancy, Course, User
from .serializers import ConsultancySerializer, CourseSerializer, UserSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token


# ----------------- Registration / Login -----------------
@api_view(['POST'])
def register_consultancy(request):
    """Register a new consultancy account"""
    data = request.data

    if User.objects.filter(username=data.get('username')).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
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

        return Response({
            'token': token.key, 
            'consultancy_id': consultancy.id
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_consultancy(request):
    """Login for both consultancy and admin users"""
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )
    
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})


# ----------------- Profile -----------------
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def consultancy_profile(request):
    """Get, update, or delete consultancy profile"""
    
    if request.method == 'DELETE':
        # Delete account
        request.user.delete()
        return Response({'success': 'Account deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    # Check if user is admin (no consultancy profile)
    if request.user.is_staff and not hasattr(request.user, 'consultancy'):
        return Response({
            'is_admin': True,
            'is_consultancy': False,
            'username': request.user.username,
            'email': request.user.email
        })
    
    # Check if user has consultancy profile
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=status.HTTP_400_BAD_REQUEST)
    
    consultancy = request.user.consultancy

    if request.method == 'GET':
        serializer = ConsultancySerializer(consultancy)
        return Response(serializer.data)
    
    # PUT - Update profile
    if request.method == 'PUT':
        serializer = ConsultancySerializer(consultancy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------- Course Management (Consultancy) -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course(request):
    """Add a new course to consultancy"""
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=status.HTTP_400_BAD_REQUEST)
    
    consultancy = request.user.consultancy
    serializer = CourseSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(consultancy=consultancy)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_course(request, course_id):
    """Edit an existing course"""
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=status.HTTP_400_BAD_REQUEST)
    
    consultancy = request.user.consultancy
    
    try:
        course = Course.objects.get(pk=course_id, consultancy=consultancy)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    """Delete a course"""
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=status.HTTP_400_BAD_REQUEST)
    
    consultancy = request.user.consultancy
    
    try:
        course = Course.objects.get(pk=course_id, consultancy=consultancy)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    course.delete()
    return Response({'success': 'Course deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_course(request):
    """Link an existing course to the consultancy"""
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=status.HTTP_400_BAD_REQUEST)
    
    consultancy = request.user.consultancy
    course_id = request.data.get('course_id')
    
    try:
        course = Course.objects.get(pk=course_id)
        
        # Check if already linked
        if course.consultancy == consultancy:
            return Response({'error': 'Course already linked'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a copy of the course for this consultancy
        new_course = Course.objects.create(
            consultancy=consultancy,
            name=course.name,
            tags=course.tags
        )
        return Response(CourseSerializer(new_course).data, status=status.HTTP_201_CREATED)
    
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlink_course(request):
    """Unlink a course from the consultancy"""
    if not hasattr(request.user, 'consultancy'):
        return Response({'error': 'User is not a consultancy'}, status=status.HTTP_400_BAD_REQUEST)
    
    consultancy = request.user.consultancy
    course_id = request.data.get('course_id')
    
    try:
        course = Course.objects.get(pk=course_id, consultancy=consultancy)
        course.delete()
        return Response({'success': 'Course unlinked'}, status=status.HTTP_204_NO_CONTENT)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


# ----------------- Public Search -----------------
@api_view(['GET'])
def search_consultancies(request):
    """Search for verified consultancies by course and country"""
    query = request.GET.get('query', '').strip()
    country = request.GET.get('country', '').strip()
    
    # Start with verified consultancies
    consultancies = Consultancy.objects.filter(is_verified=True)
    
    # Filter by country if provided
    if country:
        consultancies = consultancies.filter(countries_operated__contains=[country])
    
    # If no query, return all (filtered by country if provided)
    if not query:
        serializer = ConsultancySerializer(consultancies, many=True)
        return Response(serializer.data)
    
    # Filter by course name or tags
    result = []
    seen_ids = set()
    
    for c in consultancies:
        for course in c.courses.all():
            # Check if query matches course name or any tag
            if (query.lower() in course.name.lower() or 
                any(query.lower() in tag.lower() for tag in course.tags)):
                if c.id not in seen_ids:
                    result.append(c)
                    seen_ids.add(c.id)
                break
    
    serializer = ConsultancySerializer(result, many=True)
    return Response(serializer.data)


# ----------------- Admin - Consultancies -----------------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_list_consultancies(request):
    """List all consultancies or create a new one"""
    if request.method == 'POST':
        # Create consultancy from admin panel
        data = request.data
        
        try:
            # Create user first
            user = User.objects.create_user(
                username=data.get('username', data.get('email').split('@')[0]),
                email=data.get('email'),
                password=data.get('password', 'defaultpassword123'),
                is_consultancy=True
            )
            
            # Create consultancy
            consultancy_data = {
                'name': data.get('name'),
                'address': data.get('address'),
                'website': data.get('website'),
                'countries_operated': data.get('countries_operated', [])
            }
            
            consultancy = Consultancy.objects.create(user=user, **consultancy_data)
            serializer = ConsultancySerializer(consultancy)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    # GET - List all consultancies
    consultancies = Consultancy.objects.all()
    serializer = ConsultancySerializer(consultancies, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_consultancy_detail(request, consultancy_id):
    """Update or delete a consultancy"""
    try:
        consultancy = Consultancy.objects.get(pk=consultancy_id)
    except Consultancy.DoesNotExist:
        return Response({'error': 'Consultancy not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        consultancy.user.delete()  # Cascade deletes consultancy
        return Response({'success': 'Consultancy deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    if request.method == 'PUT':
        serializer = ConsultancySerializer(consultancy, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def verify_consultancy(request, consultancy_id):
    """Verify a consultancy"""
    try:
        consultancy = Consultancy.objects.get(pk=consultancy_id)
    except Consultancy.DoesNotExist:
        return Response({'error': 'Consultancy not found'}, status=status.HTTP_404_NOT_FOUND)
    
    consultancy.is_verified = True
    consultancy.save()
    return Response({'success': 'Consultancy verified'})


# ----------------- Admin - Users -----------------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_users(request):
    """List all users or create a new one"""
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET - List all users
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    """Update or delete a user"""
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        user.delete()
        return Response({'success': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    # PUT - Update user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------- Admin - Courses -----------------
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_courses(request):
    """List all courses or create a new one"""
    if request.method == 'POST':
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET - List all courses
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_course_detail(request, course_id):
    """Update or delete a course"""
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        course.delete()
        return Response({'success': 'Course deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    # PUT - Update course
    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)