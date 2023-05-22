from configs import SCHEMA
import uuid
import bcrypt
from utils import logger
import datetime
import json

def user_signup_checks(cursor, username, email_add):
    cursor.execute("""
        SELECT
            COUNT(*)
        FROM
            {}.user_acc_info
        WHERE
            username = %s
        OR
            user_email = %s;
    """.format(SCHEMA), (username, email_add))
    query_res = cursor.fetchall()
    if query_res[0][0] > 0:
        return False
    else:
        return True

def get_user_hashed_pass(cursor, userid):
    cursor.execute("""
        SELECT
            user_password_hash
        FROM
            {}.user_acc_info
        WHERE
            username = %s
        OR
            user_email = %s;
    """.format(SCHEMA), (userid, userid))
    query_res = cursor.fetchall()
    return query_res

def get_username(cursor, session_token):
    cursor.execute("""
        SELECT
            username,
            user_session_token_valid
        FROM
            {}.user_acc_info
        WHERE
            user_session_token = %s;
    """.format(SCHEMA), (session_token,))
    query_res = cursor.fetchall()
    if datetime.datetime.now() > query_res[0][1]:
        return []
    return query_res


def get_user_watchlist(cursor, username):
    cursor.execute("""
        SELECT
            watchlist
        FROM 
            {}.user_watch_list
        WHERE
            username = %s;
    """.format(SCHEMA), (username,))
    query_res = cursor.fetchall()
    return query_res


def user_signup_insert(connection, cursor, username, email_add, salt, pass_hash, session_token, watchlist):
    cursor.execute("""
        INSERT INTO {}.user_acc_info (
            username,
            user_password_hash,
            user_password_salt,
            user_email,
            user_session_token,
            user_session_token_valid
        )
        VALUES (
            %s,
            %s,
            %s,
            %s,
            %s,
            NOW() + INTERVAL '30 minutes'
        );
    """.format(SCHEMA), (username, pass_hash, salt, email_add, session_token))
    connection.commit()
    cursor.execute("""
        INSERT INTO {}.user_watch_list (
            username,
            watchlist
        )
        VALUES (
            %s,
            %s
        );
    """.format(SCHEMA), (username, watchlist))
    connection.commit()


def update_user_session_token(connection, cursor, session_token, userid):
    cursor.execute("""
        UPDATE {}.user_acc_info 
        SET
            user_session_token = %s,
            user_session_token_valid = NOW() + INTERVAL '30 minutes',
            updated_at = NOW()
        WHERE
            username = %s
        OR
            user_email = %s;
    """.format(SCHEMA), (session_token, userid, userid))
    connection.commit()
 
def user_signup(request, cursor, connection):
    try:
        auth_signup_res = {
            "msg": "",
            "status": False
        }
        auth_dict = request.get_json()
        checks_res = user_signup_checks(cursor, auth_dict["username"], auth_dict["email_add"])
        if checks_res is False:
            auth_signup_res["msg"] = "Username or email already exist"
            return auth_signup_res
        pass_salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(auth_dict["password"].encode('utf-8'), salt = bcrypt.gensalt())
        password_hash=password_hash.decode()
        session_token = str(uuid.uuid4())
        watchlist_id = str(uuid.uuid4())
        default_watchlist = {
            watchlist_id: {
                "name": "Default",
                "symbols": ["MSFT", "AMZN", "AAPL", "GOOG", "IBM"]
            }
        }
        user_signup_insert(connection, cursor, auth_dict["username"], auth_dict["email_add"], pass_salt, password_hash, session_token, json.dumps(default_watchlist))
        auth_signup_res["msg"] = "User created!"
        auth_signup_res["watchlists"] = default_watchlist
        auth_signup_res["watchlist_id"] = watchlist_id
        auth_signup_res["session_token"] = session_token
        auth_signup_res["status"] = True
    except Exception as e:
        logger(request, f"User sign up error: {e}")
        auth_signup_res["msg"] = "Something went wront, unable to create user!"
    return auth_signup_res


def user_login(request, cursor, connection):
    try:
        auth_login_res = {
            "msg": "",
            "status": False
        }
        auth_dict = request.get_json()
        user_info = get_user_hashed_pass(cursor, auth_dict['name'])
        if len(user_info) != 1:
            auth_login_res["msg"] = "User doesn't exist!"
            return auth_login_res
        pass_hash = user_info[0][0].strip().encode('utf-8')
        if bcrypt.hashpw(auth_dict['password'].encode('utf-8'), pass_hash) == pass_hash:
            session_token = str(uuid.uuid4())
            update_user_session_token(connection, cursor, session_token, auth_dict['name'])
            auth_login_res["msg"] = "Login success"
            auth_login_res["session_token"] = session_token
            auth_login_res["watchlists"] = get_user_watchlist(cursor, auth_dict['name'])[0][0]
            auth_login_res["status"] = True
        else:
            auth_login_res["msg"] = "Login failed! Password incorrect!"
    except Exception as e:
        logger(request, f"User sign up error: {e}")
        auth_login_res["msg"] = "Something went wront, unable to login user!"
    return auth_login_res

def validate_token(request, cursor, connection, token):
    try:
        token_validate_res = {
            "msg": "",
            "status": False
        }
        user_info = get_username(cursor, token)
        if len(user_info) != 1:
            token_validate_res["msg"] = "Token invalid"
            return token_validate_res
        else:
            token_validate_res["msg"] = "Token valid"
            token_validate_res["watchlists"] = get_user_watchlist(cursor, user_info[0][0])[0][0]
            token_validate_res["username"] = user_info[0][0]
            token_validate_res["status"] = True
    except Exception as e:
        logger(request, f"Validate token error: {e}")
        token_validate_res["msg"] = "Something went wront, unable to validate token!"
    return token_validate_res


