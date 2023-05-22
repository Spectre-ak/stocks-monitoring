import os
from flask import Flask, app, json,render_template, request, jsonify
from flask.helpers import send_file
import uuid
import json as jsonLoader
import psycopg2
# from flask_cors import CORS, cross_origin
import configs
import request_utils
from utils import logger, get_auth_token
from user_auth import user_signup, user_login, validate_token
from watchlists_utils import create_watchlist

app = Flask(__name__, static_url_path='', static_folder='static')
conn = psycopg2.connect(database=configs.DB_NAME,
                        host=configs.DB_HOST,
                        user=configs.DB_USER,
                        password=configs.DB_PASS,
                        port=configs.DB_PORT)
cursor = conn.cursor()
# cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/")
def route_dashboard():
  return app.send_static_file("index.html")

@app.route("/v1/stocks/<stock_name>", methods=["GET"])
def route_fetch_stock_metrics(stock_name):
  logger(request, f"Fetching stock details for {stock_name}")
  return request_utils.send_api_request(request, {"function": "GLOBAL_QUOTE", "symbol": stock_name})

@app.route("/v1/stocks/search/<keywords>", methods=["GET"])
def route_fetch_stock_symbols(keywords):
  logger(request, f"Fetching stock symbols for {keywords}")
  return request_utils.send_api_request(request, {"function": "SYMBOL_SEARCH", "keywords": keywords})

@app.route("/v1/auth/signup", methods=["POST"])
def route_user_signup():
  logger(request, f"Signing up user")
  return user_signup(request, cursor, conn)

@app.route("/v1/auth/login", methods=["POST"])
def route_user_login():
  logger(request, f"Logging in user")
  return user_login(request, cursor, conn)

@app.route("/v1/auth/validate/token", methods=["GET"])
def route_validate_session_token():
  logger(request, f"Validating login session token")
  return validate_token(request, cursor, conn, get_auth_token(request.headers.get('Authorization')))

@app.route("/v1/watchlist/create", methods=["POST"])
def route_create_watchlist():
  logger(request, f"Creating watchlist")
  return create_watchlist(request, cursor, conn)

if __name__ == "__main__":
  app.run(port=5000, debug=True)



