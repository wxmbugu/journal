from sqlalchemy.exc import IntegrityError
from sqlalchemy import exc
from flask import request, jsonify
from models.models import Journal, Category
from sqlalchemy.orm import joinedload
from .schema import (
    JournalSchema,
    JournalUpdateSchema,
    CategorySchema,
    CategoryUpdateSchema,
)
from main import session


class JournalHandler:
    def __init__(self):
        self.journ_schema = JournalSchema()
        self.category_schema = CategorySchema()
        self.journ_upd_schema = JournalUpdateSchema()
        self.category_upd_schema = CategoryUpdateSchema()

    def create_journal(self, user_id):
        data = request.get_json()
        validated_data, error_messages = self.journ_schema.serialize_data(data)
        if error_messages:
            return jsonify({"error": error_messages}), 400
        title = validated_data["title"]
        content = validated_data["content"]
        if "category_id" in validated_data:
            category_id = validated_data["category_id"]
        journal = Journal(
            title=title,
            content=content,
            category_id=category_id,
            user_id=user_id,
        )
        try:
            session.add(journal)
            session.commit()
            message = {
                "message": "journal entry was added successfully",
            }
            return jsonify(message), 201
        except exc.SQLAlchemyError as e:
            session.rollback()
            return (
                jsonify({"error": f"journal couldn't be created due to {e}"}),  # noqa
                400,
            )
        finally:
            session.close()

    def create_category(self, user_id):
        data = request.get_json()
        validated_data, error_messages = self.category_schema.serialize_data(data)
        if error_messages:
            return jsonify({"error": error_messages}), 400
        title = validated_data["name"]
        journal = Category(
            name=title,
            user_id=user_id,
        )
        try:
            session.add(journal)
            session.commit()
            message = {
                "message": "journal entry was added successfully",
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

    def update_journal_entry(self, user_id, journal_id):
        data = request.get_json()
        validated_data, error_messages = self.journ_upd_schema.serialize_data(
            data
        )  # Noqa
        if error_messages:
            return jsonify({"error": error_messages}), 400
        journal_data = {}
        if "title" in validated_data:
            journal_data["title"] = validated_data["title"]
        if "content" in validated_data:
            journal_data["content"] = validated_data["content"]
        if "category_id" in validated_data:
            journal_data["category_id"] = validated_data["category_id"]
        try:
            journal = (
                session.query(Journal)
                .filter_by(id=journal_id, user_id=user_id)
                .update(journal_data)  # noqa
            )
        except IntegrityError as e:
            session.rollback()
            return jsonify({"error": e}), 400
        if journal is None:
            message = {"error": "Journal not Found"}
            return jsonify(message), 401
        else:
            session.flush()
            session.commit()
            message = {"message": "journal updated successfully"}
            return jsonify(message), 200

    def update_journal_category(self, user_id, category_id):
        data = request.get_json()
        validated_data, error_messages = self.category_upd_schema.serialize_data(
            data
        )  # Noqa
        if error_messages:
            return jsonify({"error": error_messages}), 400
        category_data = {}
        if "name" in validated_data:
            category_data["name"] = validated_data["name"]
        try:
            category = (
                session.query(Category)
                .filter_by(user_id=user_id, category_id=category_id)
                .update(category_data)  # noqa
            )
        except IntegrityError as e:
            session.rollback()
            return jsonify({"error": e}), 400
        if category is None:
            message = {"error": "category not found"}
            return jsonify(message), 401
        else:
            session.flush()
            session.commit()
            message = {"message": "category updated successfully"}
            return jsonify(message), 200

    # TODO: nest the category inside the journal_entries instead of using category_id
    def fetch_journals(user_id):
        try:
            journals = (
                session.query(Journal)
                .filter_by(user_id=user_id)
                .options(joinedload(Journal.category))
                .all()
            )
            journal_entries = []
            for journal in journals:
                message = {
                    "id": journal.id,
                    "title": journal.title,
                    "category": journal.category.name,
                    "content": journal.content,
                    "date": journal.date_created,
                }
                journal_entries.append(message)
            return jsonify({"message": journal_entries}), 200
        finally:
            session.close()

    def fetch_journal(user_id, journal_id):
        try:
            print("rrrr",user_id,journal_id)
            journal = (
                session.query(Journal)
                .filter_by(id=journal_id, user_id=user_id)
                .options(joinedload(Journal.category))
                .first()
            )
            message = {
                "id": journal.id,
                "title": journal.title,
                "category": journal.category.name,
                "category_id": journal.category.id,
                "content": journal.content,
                "date": journal.date_created,
            }
            return jsonify({"message": message}), 200
        finally:
            session.close()

    def fetch_journal_by_category(user_id, category_id):
        try:
            journals = (
                session.query(Journal)
                .filter_by(user_id=user_id, category_id=category_id)
                .options(joinedload(Category.category))
                .all()
            )
            journal_entries = []
            for journal in journals:
                message = {
                    "message": {
                        "title": journal.title,
                        "category": journal.category.name,
                        "content": journal.content,
                    }
                }
                journal_entries.append(message)
            return jsonify({"message": journal_entries}), 200
        finally:
            session.close()

    def fetch_category_details(user_id):
        try:
            categories = session.query(Category).filter_by(user_id=user_id).all()
            category_entries = []
            for category in categories:
                message = {
                    "id": category.id,
                    "name": category.name,
                }
                category_entries.append(message)
            return jsonify({"message": category_entries}), 200
        finally:
            session.close()

    def delete_journal(user_id, journal_id):
        session.query(Journal).filter_by(id=journal_id, user_id=user_id).delete()
        session.commit()
        message = {"message": "journal deleted successfully"}
        return jsonify(message), 200

    #  TODO:handle error emerging after a user deletes a category
    def delete_category(user_id, category_id):
        session.query(Category).filter_by(id=category_id, user_id=user_id).delete()
        session.commit()
        message = {"message": "category deleted successfully"}
        return jsonify(message), 200
