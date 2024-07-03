from flask import Blueprint
from flask_jwt_extended import get_jwt_identity
from api.journal import JournalHandler
from flask_jwt_extended import jwt_required


journal_bp = Blueprint("journal", __name__)


@journal_bp.route("", methods=["POST"])
@jwt_required(optional=False)
def create_journal():
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().create_journal(user_id)


@journal_bp.route("new_category", methods=["POST"])
@jwt_required(optional=False)
def create_category():
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().create_category(user_id)


@journal_bp.route("/<journal_id>", methods=["PUT"])
@jwt_required(optional=False)
def update_journal(journal_id):
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().update_journal_entry(user_id, journal_id)


@journal_bp.route("/category/<category_id>", methods=["PUT"])
@jwt_required(optional=False)
def update_category(category_id):
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().update_journal_category(user_id, category_id)


@journal_bp.route("", methods=["GET"])
@jwt_required(optional=False)
def fetch_journals():
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().fetch_journals(user_id)


@journal_bp.route("/<journal_id>", methods=["GET"])
@jwt_required(optional=False)
def fetch_journal(journal_id):
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().fetch_journal(user_id, journal_id)


@journal_bp.route("/category/<category_id>", methods=["GET"])
@jwt_required(optional=False)
def fetch_journal_by_category(category_id):
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().fetch_journal_by_category(user_id, category_id)


@journal_bp.route("/category", methods=["GET"])
@jwt_required(optional=False)
def fetch_categories():
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().fetch_category_details(user_id)


@journal_bp.route("/<journal_id>", methods=["DELETE"])
@jwt_required(optional=False)
def delete_journal(journal_id):
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().delete_journal(user_id, journal_id)


@journal_bp.route("/category/<category_id>", methods=["DELETE"])
@jwt_required(optional=False)
def delete_category(category_id):
    current_identity = get_jwt_identity()
    user_id = current_identity["id"]
    return JournalHandler().delete_category(user_id, category_id)
