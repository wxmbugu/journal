from flask import Blueprint
from flask_jwt_extended import get_jwt_identity
from api.users import Users
from flask_jwt_extended import jwt_required



bp = Blueprint("auth", __name__)


@bp.route("/signup", methods=["POST"])
def register():
    return Users().register()


@bp.route("/login", methods=["POST"])
def login():
    return Users().login()


@bp.route("/reset_password", methods=["POST"])
@jwt_required(optional=False)
def password_reset():
    current_identity = get_jwt_identity()
    email = current_identity["email"]
    return Users().password_reset(email)


@bp.route("/update_details", methods=["PUT"])
@jwt_required(optional=False)
def update_details():
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return Users().update_user_details(user_id)


@bp.route("/get_details/<user_id>", methods=["GET"])
@jwt_required(optional=False)
def fetch_user_details(user_id):
    return Users.fetch_user_details(user_id)


@bp.route("/refresh", methods=["GET"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    return Users.refresh_token(current_user["id"])


@bp.route("/account/activation", methods=["GET"])
def activate():
    return Users.activate_account()


@bp.route("/account/activation", methods=["POST"])
def request_activation_link():
    return Users().request_activate_account()
