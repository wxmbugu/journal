# flake8: noqa: E501
from sqlalchemy import Integer, String, DateTime, Boolean, ForeignKey, Column, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.dialects.mysql import FLOAT
from flask_sqlalchemy import SQLAlchemy  # noqa
from main import app

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(Integer, primary_key=True)
    contact = db.Column(String(40), nullable=True, unique=True)
    email = db.Column(String(80), nullable=False, unique=True)
    username = db.Column(String(80), nullable=False, unique=True)
    activation_key = db.Column(String(50), nullable=True)
    activation = db.Column(Boolean, default=False)
    activation_date_created = db.Column(DateTime, nullable=True)
    hash_password = db.Column(String(80), nullable=False)
    created_date = db.Column(DateTime, nullable=False, default=datetime.now)  # noqa

    def __repr__(self):
        return "<User %r>" % self.email


class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("User", backref="categories")
    name = db.Column(String(80), nullable=True)


class Journal(db.Model):
    __tablename__ = "journal"
    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("User", backref="journal")
    title = db.Column(String(80), nullable=True)
    content = db.Column(String(1000), nullable=True)
    category_id = db.Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", backref="journal")

    date_created = db.Column(DateTime, nullable=False, default=datetime.now)  # noqa

    def __repr__(self):
        return "<Journal %r>" % self.id
