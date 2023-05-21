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
  return(
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
  const response = await fetch(url, {
    method: method,
    body: method==='GET' ? null : JSON.stringify(body),
    headers: headers
  });
  const response_parsed = await response.json()
  return response_parsed;
};


const updateUserSession = (login_info) => {
  localStorage.setItem("auth_token", login_info.auth_token);
  localStorage.setItem("auth_token_expiry", login_info.auth_token_expiry);
};

export {TextField, AuthHandlerFooter, fetcherApi, updateUserSession};