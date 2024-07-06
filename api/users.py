from sqlalchemy.exc import IntegrityError
from sqlalchemy import exc
from flask import request, jsonify, redirect
from jobs.job_handler import Worker
import time
from models.models import User
from const.constants import (
    VERIFICATION_EXPIRY_TIME,
    SERVER_TIME_ZONE,
)
from datetime import datetime
from auth.jwt import create_token
from .schema import (
    LoginSchema,
    RegisterSchema,
    PasswordResetSchema,
    UpdateUserSchema,
    AccountActivateSchema,
)
from main import (
    bcrypt,
    session,
    VERIFICATION_URL,
    ACCOUNT_VERIFICATION_URL,
    ACCOUNT_REQUEST_ACTIVATION_URL,
)
from .utils import (
    encode_verification_key,
    account_verification_email_template,
    decode_verification_key,
)
import re
from main import mail
import uuid


def verification_code():
    code = str(uuid.uuid4())
    return code


def send_account_verification_emails(recipient, first_name, verification_link):
    email = account_verification_email_template(
        recipient, first_name, verification_link
    )
    mail.send(email)


def verification_link_builder(encrypted_code):
    return f"{VERIFICATION_URL}?code={encrypted_code}"


class Users:
    def __init__(self):
        self.login_schema = LoginSchema()
        self.reg_schema = RegisterSchema()
        self.activate_schema = AccountActivateSchema()
        self.password_reset_schema = PasswordResetSchema()
        self.update_user = UpdateUserSchema()

    # Customer login

    def login(self):
        data = request.get_json()
        validated_data, error_messages = self.login_schema.serialize_login_data(  # noqa
            data
        )  # noqa
        if error_messages:
            return jsonify({"error": error_messages}), 400
        email = validated_data["email"]
        password = validated_data["password"]
        try:
            user = session.query(User).filter_by(email=email).first()
            if user is None:
                message = {"error": "User not Found"}
                return jsonify(message), 401
            if bcrypt.check_password_hash(user.hash_password, password):
                access_token, refresh_token = create_token(user)
                message = {
                    "message": "Successful Login",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user_id": user.id,
                    "user_email": user.email,
                }
                return jsonify(message), 200
            else:
                message = {"error": "Invalid Credentials"}
                return jsonify(message), 401
        finally:
            session.close()

    def activate_account():
        code = decode_verification_key(request.args.get("code", type=str))
        if code is None:
            return jsonify("Invalid verification"), 400
        try:
            user = session.query(User).filter_by(activation_key=code).first()
            if user is None:
                return (
                    jsonify(
                        {
                            "error": "restart account verification\
                                    ,malformed request"
                        }
                    ),
                    400,
                )
            activation_timestamp_user = user.activation_date_created.astimezone(  # noqa
                SERVER_TIME_ZONE
            )
            current_time_user = datetime.now(SERVER_TIME_ZONE)
            elapsed_time = current_time_user - activation_timestamp_user
            if elapsed_time.total_seconds() < VERIFICATION_EXPIRY_TIME:
                user.activation = True
                session.flush()
                session.commit()
                return redirect(ACCOUNT_VERIFICATION_URL)
            else:
                return redirect(ACCOUNT_REQUEST_ACTIVATION_URL)
        except exc.SQLAlchemyError:
            session.rollback()
            return (
                jsonify({"error": extract_error_message(e)}),  # noqa
                400,
            )
        finally:
            session.close()

    def request_activate_account(self):
        data = request.get_json()
        validated_data, error_messages = self.activate_schema.serialize_data(
            data
        )  # noqa
        if error_messages:
            return jsonify({"error": error_messages}), 400
        try:
            user = (
                session.query(User)
                .filter_by(email=validated_data["email"])
                .first()  # noqa
            )
            if user is None:
                return jsonify({"error": "no such user"}), 404
            code = verification_code()
            if user.activation:
                return jsonify({"error": "Account is already verified"}), 400
            user.activation_key = code
            user.activation_date_created = datetime.fromtimestamp(time.time())
            session.flush()
            session.commit()
            encrypted_code = encode_verification_key(code)
            verification_link = verification_link_builder(
                encrypted_code.decode()
            )  # noqa
            email_worker = Worker(
                callback_fn=lambda: send_account_verification_emails(
                    user.email, user.username, verification_link
                )
            )
            email_worker.start()
            return (
                jsonify({"message": "verification link sent"}),  # noqa
                200,
            )

        except exc.SQLAlchemyError as e:
            session.rollback()
            return (
                jsonify({"error": e}),  # noqa
                400,
            )
        finally:
            session.close()

    def register(self):
        data = request.get_json()
        validated_data, error_messages = self.reg_schema.serialize_register_data(data)
        if error_messages:
            return jsonify({"error": error_messages}), 400
        email = validated_data["email"]
        username = validated_data["username"]
        contact = validated_data["phone_number"]
        password = validated_data["password"]
        password_hash = bcrypt.generate_password_hash(password)
        code = verification_code()
        encrypted_code = encode_verification_key(code)
        verification_link = verification_link_builder(encrypted_code.decode())
        user = User(
            email=email,
            username=username,
            hash_password=password_hash,
            contact=contact,
            activation_key=code,
            activation_date_created=datetime.fromtimestamp(time.time()),
        )
        try:
            session.add(user)
            session.commit()
            email_worker = Worker(
                callback_fn=lambda: send_account_verification_emails(
                    user.email, user.username, verification_link
                )
            )
            email_worker.start()
            message = {
                "message": "Creation of Account was successful,check your email to verify your account",
            }
            return jsonify(message), 201
        except IntegrityError as e:
            session.rollback()
            return (
                jsonify({"error": extract_error_message(e)}),  # noqa
                400,
            )
        finally:
            session.close()

    # All users reset password
    def password_reset(self, email):
        data = request.get_json()
        validated_data, error_messages = (
            self.password_reset_schema.serialize_password_reset_data(data)
        )  # Noqa
        if error_messages:
            return jsonify({"error": error_messages}), 400

        old_password = validated_data["old_password"]
        new_password = validated_data["new_password"]
        user = session.query(User).filter_by(email=email).first()
        if user is None:
            message = {"error": "User not Found"}
            return jsonify(message), 401
        if bcrypt.check_password_hash(user.hash_password, old_password) is False:
            message = {
                "error": "This isn't your previous password, check again",
            }
            return jsonify(message), 400
        if bcrypt.check_password_hash(user.hash_password, new_password):
            message = {
                "error": "You can't use previous password as new password",
            }
            return jsonify(message), 400
        else:
            user.hash_password = bcrypt.generate_password_hash(new_password)
            session.flush()
            session.commit()
            message = {"message": "Password updated successfully"}
            return jsonify(message), 200

    def update_user_details(self, user_id):
        data = request.get_json()
        validated_data, error_messages = self.update_user.serialize_user_data(
            data
        )  # Noqa
        if error_messages:
            return jsonify({"error": error_messages}), 400
        user_data = {}
        if "email" in validated_data:
            user_data["email"] = validated_data["email"]
        if "username" in validated_data:
            user_data["username"] = validated_data["username"]
        if "phone_number" in validated_data:
            user_data["contact"] = validated_data["phone_number"]
        try:
            user = session.query(User).filter_by(id=user_id).update(user_data)
        except IntegrityError as e:
            session.rollback()
            return jsonify({"error": extract_error_message(e)}), 400
        if user is None:
            message = {"error": "User not Found"}
            return jsonify(message), 401
        else:
            session.flush()
            session.commit()
            message = {"message": "user details updated successfully"}
            return jsonify(message), 200

    def fetch_user_details(user_id):
        try:
            user = session.query(User).filter_by(id=user_id).first()
            if user is None:
                message = {"error": "User not Found"}
                return jsonify(message), 401
            else:
                message = {
                    "email": user.email,
                    "username": user.username,
                    "phone_number": user.contact,
                    "date_created": user.created_date,
                }
                return jsonify(message), 200
        finally:
            session.close()

    def delete_user(user_id):
        session.query(User).filter_by(id=user_id).delete()
        session.commit()
        message = {"message": "account deleted successfully"}
        return jsonify(message), 200

    def refresh_token(user_id):
        try:
            user = session.query(User).filter_by(id=user_id).first()
            access_token, refresh_token = create_token(user)  # noqa
            message = {
                "message": "token refresh was successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_id": user.id,
                "user_email": user.email,
            }
            return jsonify(message), 200
        finally:
            session.close()


def extract_error_message(error):
    error_str = str(error)
    match = re.search(r"Duplicate entry '(.+?)' for key '(.+?)'", error_str)
    if match:
        field_value = match.group(1)
        field_name = match.group(2)
        if field_name == "users.email":
            return f"The email '{field_value}' is already registered."
        elif field_name == "users.contact":
            return f"The contact '{field_value}' is already in use."
        else:
            return f"{field_value} already in use."
    else:
        return "An integrity constraint violation occurred. Please try again."
