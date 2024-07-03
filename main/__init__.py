from flask import Flask
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_cors import CORS
from flask_mail import Mail
import os
from datetime import timedelta
from dotenv import load_dotenv


load_dotenv()
app = Flask(__name__)
engine = create_engine(os.getenv("MYSQL_DATABASE_URI"), pool_recycle=3600)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("MYSQL_DATABASE_URI")
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = os.getenv("MAIL_PORT")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS")
app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
VERIFICATION_URL = os.getenv("SERVER_VERIFICATION_URL")
ACCOUNT_VERIFICATION_URL = os.getenv("CLIENT_ACCOUNT_VERIFICATION_URL")
ACCOUNT_REQUEST_ACTIVATION_URL = os.getenv("CLIENT_ACCOUNT_REQUEST_ACTIVATION_URL")
KEY = os.getenv("ENC_KEY")

jwt = JWTManager(app)
cors = CORS(app, resource={r"/*": {"origins": "*"}})
bcrypt = Bcrypt(app)
mail = Mail(app)

session = scoped_session(
    sessionmaker(
        autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
    )  # noqa
)
SWAGGER_URL = "/api/v1/docs"
API_URL = "/static/swagger.json"
from urls.users import bp  # noqa

app.register_blueprint(bp, url_prefix="/api/v1/authentication")


from models.models import db  # noqa


migrate = Migrate(app, db)
migrate.init_app(app)
