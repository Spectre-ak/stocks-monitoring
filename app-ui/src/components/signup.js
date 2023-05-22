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
  toaster,
  useToaster
} from 'rsuite';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthErrorMessage, AuthHandlerFooter, fetcherApi, TextField, updateUserSession } from './utils';

const { StringType } = Schema.Types;
const model = Schema.Model({
  username: StringType().isRequired('This field is required.'),
  email_add: StringType()
    .isEmail('Please enter a valid email address.')
    .isRequired('This field is required.'),
  password: StringType().isRequired('This field is required.')
    .addRule((value) => {
      if(value.length < 5)
        return false;
      return true;
    }, 'Password must be at least 5 character long'),
  password_cnf: StringType()
    .addRule((value, data) => {
      if (value !== data.password) {
        return false;
      }
      return true;
    }, 'The two passwords do not match')
    .isRequired('This field is required.')
});


function SignupPage(props){
  const formRef = React.useRef();
  const [formValue, setFormValue] = React.useState({
    username: '',
    email_add: '',
    password: '',
    password_cnf: ''
  });
  const [formError, setFormError] = React.useState({});
  const [loaderState, setLoaderState] = React.useState("Sign Up");
  const toaster = useToaster();

  const handleSubmit = () => {
    if (!formRef.current.check())
      return;
    setLoaderState(<Loader content="Signing in..." />);
    fetcherApi(
      '/v1/auth/signup',
      'POST',
      formValue
    ).then(response => {
      console.log(response);
      if(response.status) {
        updateUserSession(response);
        window.location.reload();
      } else {
        setLoaderState("Sign Up");
        toaster.push(
          <Message closable type="error">
            {response.msg}
          </Message>, 
          { placement: "topCenter", duration: 30000 }
        );
      }
    }).catch(error => {
      console.error(error);
      setLoaderState("Sign Up");
      toaster.push(
        <Message closable type="error">
          Something went wrong, unable to sign up
        </Message>, 
        { placement: "topCenter", duration: 30000 }
      );
    });
  };


  return(
    <Panel header={<h3>Create Account</h3>} bordered>
      <Form
        fluid
        model={model}
        onSubmit={handleSubmit}
        ref={formRef}
        formValue={formValue}
        onCheck={setFormError}
        onChange={setFormValue}
      >
        <TextField name="username" label="Username" />
        <TextField name="email_add" label="Email address" type="email" />
        <TextField name="password" label="Password" type="password" autoComplete="off"/>
        <TextField name="password_cnf" label="Confirm Password" type="password" autoComplete="off"/>
        <AuthHandlerFooter
          button_name={loaderState}
          setLoginPage={false}
          setAuthPageState={props.setAuthPageState}
          auth_switch_msg="Already have an account? Login In"
        />
      </Form>
    </Panel>
  );
}

export default SignupPage;