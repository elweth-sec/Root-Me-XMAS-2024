import os
import secrets

class Config:
    SECRET_KEY = secrets.token_hex(32)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///route-mi.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
