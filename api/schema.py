from marshmallow import Schema, fields, ValidationError, validate


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(
        required=True, error_messages={"required": "Password is required."}
    )

    def serialize_login_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class PasswordResetSchema(Schema):
    old_password = fields.Str(required=True)
    new_password = fields.Str(required=True)

    def serialize_password_reset_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class UpdateUserSchema(Schema):
    email = fields.Email()
    username = fields.Str()
    phone_number = fields.Str(
        validate=validate.Length(
            max=20,
            error="Phone number must be a string shorter than 20 letters.",  # noqa
        ),
    )

    def serialize_user_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class RegisterSchema(Schema):
    email = fields.Email(required=True)
    username = fields.Str(required=True)
    phone_number = fields.Str(
        validate=validate.Length(
            max=20,
            error="Phone number must be a string shorter than 20 letters.",  # noqa
        ),
    )
    password = fields.Str(required=True, min=6)

    def serialize_register_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class AccountActivateSchema(Schema):
    email = fields.Email(required=True)

    def serialize_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class CategorySchema(Schema):
    name = fields.Str(required=True)

    def serialize_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class JournalSchema(Schema):
    title = fields.Str(required=True)
    content = fields.Str(required=True)
    category_id = fields.Integer()

    def serialize_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class JournalUpdateSchema(Schema):
    title = fields.Str()
    content = fields.Str()
    category_id = fields.Integer()

    def serialize_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages


class CategoryUpdateSchema(Schema):
    name = fields.Str()

    def serialize_data(self, data):
        try:
            validated_data = self.load(data)
            return validated_data, None
        except ValidationError as err:
            return None, err.messages
