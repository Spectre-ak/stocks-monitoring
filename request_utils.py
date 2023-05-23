from urllib.parse import urlencode
import os
import requests
from flask import make_response
import random
import string
from utils import logger
from configs import api_base_url, proxy_base_url, api_keys, proxy_api_keys
from utils import get_auth_token
from user_auth import validate_token, get_username

def req_auth(request, cursor, connection):
  res = make_response('Response')
  res.status_code = 401
  try:
    path = request.path
    if path not in ["/v1/watchlist/create", "/v1/watchlist/update"]:
      return {
        "res": res,
        "status": True
      }
    headers = request.headers
    if "Authorization" not in headers.keys() or "Bearer" not in headers["Authorization"]:
      raise Exception("Invalid auth header")
    user_info = get_username(cursor, get_auth_token(headers["Authorization"]), connection)
    return {
      "res": res,
      "status": len(user_info) == 1
    }
  except Exception as e:
    return{
      "res": res,
      "status": False
    }


def send_api_request(request, params):
  api_res={}
  fetched=False
  for api_key in api_keys:
    params['apikey']=api_key
    req_url=f"{api_base_url}?{urlencode(params)}"
    r = requests.get(req_url)
    api_res = r.json()
    if 'Error Message' in api_res or 'Note' in api_res:
      for proxy_api_key in proxy_api_keys:
        proxy_server_params = {
          'access_key': proxy_api_key,
          'url': req_url
        }
        r = requests.get(proxy_base_url, proxy_server_params)
        api_res = r.json()
        if 'success' in api_res and api_res['success'] is False:
          continue
        else:
          logger(request, f"Proxy returned response succesfully")
          if 'Error Message' in api_res or 'Note' in api_res:
            logger(request, f"Proxy returned response is not valid, trying with different stock api key")
          else:
            logger(request, f"Proxy returned response is valid, exiting loops")
            fetched=True
          break
      if fetched:
        break
    else:
      fetched=True
      break

  return api_res


