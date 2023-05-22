from datetime import datetime

def logger(request, msg):
  print({
    "time": f"{datetime.utcnow()}",
    "route": request.path,
    "message": msg
  })


def get_auth_token(header):
  return header.split("Bearer ")[1]