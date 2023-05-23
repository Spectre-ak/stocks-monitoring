import {
  Container,
  Header,
  Content,
  Footer,
  Form,
  ButtonToolbar,
  Button,
  Navbar,
  Panel,
  FlexboxGrid,
  Schema,
  Message
} from 'rsuite';


const TextField = (props) => {
  const { name, label, accepter, ...rest } = props;
  return (
    <Form.Group controlId={`${name}-3`}>
      <Form.ControlLabel>{label} </Form.ControlLabel>
      <Form.Control name={name} accepter={accepter} {...rest} />
    </Form.Group>
  );
}

const AuthHandlerFooter = (props) => {
  return (
    <Form.Group>
      <ButtonToolbar>
        <Button appearance="primary" type="submit">{props.button_name}</Button>
        <Button
          appearance="link"
          onClick={() => {
            props.setAuthPageState(props.setLoginPage)
          }}
        >
          {props.auth_switch_msg}
        </Button>
      </ButtonToolbar>
    </Form.Group>
  )
}

const fetcherApi = async (
  url,
  method,
  body
) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`
  }
  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: method,
    body: method === 'GET' ? null : JSON.stringify(body),
    headers: headers
  });
  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  const response_parsed = await response.json()
  return response_parsed;
};

const checkUserSessionOver = (e, toaster) => {
};

const updateUserSession = (login_info) => {
  localStorage.setItem("auth_token", login_info.session_token);
};

const updateSelectedWatchlist = (watchlist_id) => {
  localStorage.setItem("saved_watchlist", watchlist_id);
};

const deleteUserSession = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("saved_watchlist");
};

const AuthErrorMessage = (props) => {
  return (
    <Message closable type="error">
      {props.msg}
    </Message>
  )
};

export { TextField, AuthHandlerFooter, fetcherApi, updateUserSession, AuthErrorMessage, updateSelectedWatchlist, deleteUserSession, checkUserSessionOver };