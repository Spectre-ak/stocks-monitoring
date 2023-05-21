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
  Loader,
  Message,
  useToaster
} from 'rsuite';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthHandlerFooter, fetcherApi, TextField } from './utils';


const { StringType } = Schema.Types;
const model = Schema.Model({
  name: StringType().isRequired('This field is required.'),
  password: StringType().isRequired('This field is required.')
});


function LoginPage(props){ 
  const formRef = React.useRef();
  const [formValue, setFormValue] = React.useState({
    name: '',
    password: ''
  });
  const [formError, setFormError] = React.useState({});
  const [loaderState, setLoaderState] = React.useState("Log in");
  const toaster = useToaster();

  const handleSubmit = () => {
    if (!formRef.current.check())
      return;
    setLoaderState(<Loader content="Signing in..." />);
    fetcherApi(
      '/v1/auth/login',
      'POST',
      formValue
    ).then(response => {
      console.log(response.status);
      setLoaderState("Log in");
    }).catch(error => {
      console.error(error);
      setLoaderState("Log in");
      toaster.push(
        <Message closable type="error">
          Something went wrong, unable to sign in
        </Message>, 
        { placement: "topCenter", duration: 30000 }
      );
    });
  };

  return(
    <Panel header={<h3>Please login to proceed</h3>} bordered>
      <Form 
        fluid
        model={model}
        onSubmit={handleSubmit}
        ref={formRef}
        formValue={formValue}
        onCheck={setFormError}
        onChange={setFormValue}
      >
        <TextField name="name" label="Username or email address" />
        <TextField name="password" label="Password" type="password" autoComplete="off" />
        <AuthHandlerFooter
          button_name={loaderState}
          setLoginPage={true}
          setAuthPageState={props.setAuthPageState}
          auth_switch_msg="Sign Up"
        />
      </Form>
    </Panel>
  );
}

export default LoginPage;