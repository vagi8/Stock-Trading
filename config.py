from os import environ, path
from dotenv import load_dotenv
import os
basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))


class Config:
    """Base config."""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'


class ProdConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('PROD_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SCHEDULER_API_ENABLED = True

class DevConfig(Config):
    FLASK_ENV = 'development'
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = environ.get("DEV_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SCHEDULER_API_ENABLED = True