## Stock Trading Platform 
 
 Author - Vageeshan

![User Home](https://github.com/vagi8/Stock-Trading/blob/main/user_home.PNG?raw=true)

## Installation
 - Install python (recommended - V3.7)
 - [optional] setup virtual environment (recommended) and activate it
 - Clone repo - `git clone <repo>`
 - Move to project directory - `cd "Stock-Trading - Prod"`
 - Install packages - `pip install -r requirements.txt`
 - After successfully installation, run the project `python wsgi.py`

### DB
DB is located at `.\trading` with .sqlite3

### .env
- SECRET KEY
- Dev database filename
- Prod database filename

### Production

To run project in production flask, in `.trading/__init__.py` use line 14,15 to use dev/prod environments.

### Architecture

![Architecture](https://github.com/vagi8/Stock-Trading/blob/main/architecture.jpeg?raw=true)
