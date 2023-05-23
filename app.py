
from flask import Flask, app, request, redirect, url_for, make_response
import json as jsonLoader
import psycopg2
import configs
from request_utils import req_auth, send_api_request
from utils import logger, get_auth_token
from user_auth import user_signup, user_login, validate_token
from watchlists_utils import create_watchlist, update_watchlist

app = Flask(__name__, static_url_path='', static_folder='static')
conn = psycopg2.connect(database=configs.DB_NAME,
                        host=configs.DB_HOST,
                        user=configs.DB_USER,
                        password=configs.DB_PASS,
                        port=configs.DB_PORT)
cursor = conn.cursor()
# cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.before_request
def before_request():
    auth_res = req_auth(request, cursor, conn)
  
    if auth_res["status"] is False:
      return auth_res["res"]

@app.route("/")
def route_dashboard():
  return app.send_static_file("index.html")

@app.route("/v1/stocks/<stock_name>", methods=["GET"])
def route_fetch_stock_metrics(stock_name):
  logger(request, f"Fetching stock details for {stock_name}")
  return send_api_request(request, {"function": "GLOBAL_QUOTE", "symbol": stock_name})

@app.route("/v1/stocks/search/<keywords>", methods=["GET"])
def route_fetch_stock_symbols(keywords):
  logger(request, f"Fetching stock symbols for {keywords}")
  return send_api_request(request, {"function": "SYMBOL_SEARCH", "keywords": keywords})

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

@app.route("/v1/watchlist/update", methods=["POST"])
def route_update_watchlist():
  logger(request, f"Creating watchlist")
  return update_watchlist(request, cursor, conn)

if __name__ == "__main__":
  if configs.ENV == "LOCAL":
    app.run(port=5000, debug=True)
  elif configs.ENV == "UAT":
    app.run(host='0.0.0.0', port=5000)
  else:
    logger("Unidentified env variable. Cannot start server.")




