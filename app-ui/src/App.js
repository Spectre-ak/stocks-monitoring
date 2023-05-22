import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, createContext, useContext } from 'react';

import LoginPage from './components/login';
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
  Message,
  useToaster,
  Placeholder,
  Loader
} from 'rsuite';
import SignupPage from './components/signup';
import { fetcherApi } from './components/utils';
import { DashboardPageHandler } from './components/sidebar';


const DashboardAuthPage = () => {
  const [isSignUpPage, setAuthPageState] = useState(false);
  const [authPage, setAuthPage] = useState('');
  const toaster = useToaster();
  useEffect(() => {
    setAuthPage(isSignUpPage ? <SignupPage setAuthPageState={setAuthPageState}/> : <LoginPage setAuthPageState={setAuthPageState}/>);
  }, [isSignUpPage]);
  return (
    <div className={isSignUpPage ? "auth_signup_page" : "auth_login_page"}>
      <Container>
        <Header>
          <Navbar appearance="inverse">
            <Navbar.Brand>
              <b>Stock Monitoring Portal</b>
            </Navbar.Brand>
          </Navbar>
        </Header>
        <div>
        <Content>
          <FlexboxGrid justify="center">
            <FlexboxGrid.Item colspan={8}>
                {authPage}
              </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
        </div>
      </Container>
    </div>
  );
}

const PageCenterLoader = (props) => {
  return(
    <div>
      <Placeholder.Paragraph rows={10} />
      <Loader backdrop content={props.info} vertical size="md"/>
    </div>
  )
}



const DashboardEntry = () => {
  const [dashboardPage, setDashboardPage] = useState(<PageCenterLoader info="Loading stock monitoring portal..."/>);
  useEffect(() => {
    fetcherApi(
      '/v1/auth/validate/token',
      'GET',
      {}
    ).then(response => {
      console.log('validate token respnse');
      console.log(response);
      if(response.status) {
        const savedWatchlist = localStorage.getItem("saved_watchlist") === null ? Object.keys(response.watchlists)[0] : localStorage.getItem("saved_watchlist");
        console.log(savedWatchlist);
        setDashboardPage(<DashboardPageHandler userInfo={response} savedWatchlist={savedWatchlist}/>);
      } else
        setDashboardPage(<DashboardAuthPage/>);
    }).catch(error => {
      console.error(error);
      setDashboardPage(<DashboardAuthPage/>);
    });
  }, []);

  return (
    <>
      {dashboardPage}
    </>
  );
}

export {DashboardAuthPage, DashboardEntry, PageCenterLoader};
