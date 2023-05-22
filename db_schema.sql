CREATE TABLE public.user_acc_info (
	id serial,
	username VARCHAR ( 255 ) UNIQUE NOT NULL PRIMARY KEY,
	user_password_hash CHAR ( 512 ) NOT NULL,
	user_password_salt CHAR ( 255 ) NOT NULL,
	user_email VARCHAR ( 255 ) UNIQUE NOT NULL,
	user_session_token VARCHAR ( 255 ) UNIQUE NOT NULL,
	user_session_token_valid TIMESTAMP NOT NULL DEFAULT NOW(),
	user_metadata json,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_watch_list (
	id serial,
	username VARCHAR ( 255 ) UNIQUE NOT NULL PRIMARY KEY,
	watchlist json NOT NULL DEFAULT '{}',
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



