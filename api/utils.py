from flask_mail import Message
import base64


def encode_verification_key(code):
    encrypted_code = base64.b64encode(str.encode(code))
    return encrypted_code


def decode_verification_key(enc_code):
    code = base64.b64decode(enc_code)
    return code


def account_verification_email_template(
    recipient,
    first_name,
    verification_link,
):
    msg = Message(
        "Account Registration",
        sender="do-not-reply@codefremics.com",
        recipients=[recipient],  # noqa
    )
    template_file = open("template/registration_email_template.html")
    msg.html = template_file.read().format(
        first_name=first_name, verification_link=verification_link
    )
    return msg
