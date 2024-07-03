from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_refresh_token
from models.models import User
from jwt.api_jwt import PyJWT


def user_serializer(user):
    """Custom JSON serializer for User object."""
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
    }


def create_token(user: User):

    PyJWT()
    access_token = create_access_token(identity=user_serializer(user))
    refresh_token = create_refresh_token(identity=user_serializer(user))
    return access_token, refresh_token
