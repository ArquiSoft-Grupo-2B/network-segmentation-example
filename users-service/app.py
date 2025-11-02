from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Conexión a MongoDB
client = MongoClient("mongodb://mongodb:27017/")
db = client["usersdb"]
users_collection = db["users"]


@app.route("/")
def home():
    return "Backend 1 - Users API"


@app.route("/api/users", methods=["POST"])
def create_user():
    try:
        data = request.get_json()
        username = data.get("username")

        if not username:
            return jsonify({"error": "Username is required"}), 400

        # Verificar si el usuario ya existe
        existing_user = users_collection.find_one({"username": username})
        if existing_user:
            return jsonify({"error": "Username already exists", "exists": True}), 409

        # Crear nuevo usuario
        user = {"username": username, "created_at": datetime.utcnow()}
        result = users_collection.insert_one(user)

        return (
            jsonify(
                {
                    "message": "User created successfully",
                    "username": username,
                    "exists": False,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<username>", methods=["GET"])
def get_user(username):
    try:
        user = users_collection.find_one({"username": username})
        if user:
            return jsonify({"username": user["username"], "exists": True}), 200
        else:
            return jsonify({"exists": False}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["GET"])
def get_all_users():
    try:
        users = list(
            users_collection.find({}, {"_id": 0, "username": 1, "created_at": 1})
        )
        return jsonify(users), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
