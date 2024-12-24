import os
import uuid
import re
from flask import Flask, request, jsonify, make_response, render_template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

SESSION_DIR = './sessions'
os.makedirs(SESSION_DIR, exist_ok=True)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(10), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

with app.app_context():
    db.create_all()

def create_session(email, name, role):
    session_id = str(uuid.uuid4())
    session_file = os.path.join(SESSION_DIR, f'session_{session_id}.conf')

    with open(session_file, 'w') as f:
        f.write(f'email={email}\n')
        f.write(f'role={role}\n')
        f.write(f'name={name}\n')

    return session_id

def load_session(session_id):
    if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', session_id):
        return None

    session_file = os.path.join(SESSION_DIR, f'session_{session_id}.conf')
    if not os.path.exists(session_file):
        return None

    session_data = {}
    with open(session_file, 'r') as f:
        for line in f:
            key, value = line.strip().split('=')
            session_data[key] = value
    return session_data

@app.route('/', methods=['GET'])
def home():
    return render_template("index.html")

@app.route('/register', methods=['POST'])
def register():
    email = request.json.get('email')
    name = request.json.get('name')
    password = request.json.get('password')

    password_hash = generate_password_hash(password)

    user = User(email=email, name=name, role='user', password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify(success="User registered successfully"), 201

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        session_id = create_session(user.email, user.name, user.role)
        response = make_response(jsonify(success="Logged in successfully"))
        response.set_cookie('session_id', session_id)
        return response
    
    return jsonify(error="Invalid credentials"), 401

@app.route('/dashboard')
def dashboard():
    session_id = request.cookies.get('session_id')
    if not session_id:
        return jsonify(error="Not connected"), 401

    session_data = load_session(session_id)
    if not session_data:
        return jsonify(error="Invalid session"), 401

    return jsonify(message=f"Welcome, {session_data['name']}! Role: {session_data['role']}"), 200

@app.route('/admin')
def admin():
    session_id = request.cookies.get('session_id')
    if not session_id:
        return jsonify(error="Not connected"), 401

    session_data = load_session(session_id)
    if not session_data:
        return jsonify(error="Invalid session"), 401

    if session_data['role'] != 'admin':
        return jsonify(error="Forbidden access, you are not an administrator."), 403

    try:
        with open('flag.txt') as f:
            flag = f.read().strip()
        return jsonify(success=f"Welcome back admin! Here is the flag: {flag}"), 200
    except FileNotFoundError:
        return jsonify(error="Flag file not found, contact admin."), 404

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)
