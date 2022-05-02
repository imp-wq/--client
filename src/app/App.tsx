import React, {Suspense} from 'react';
import './app.css'
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import styled from 'styled-components';
// import PageNotFound from '../Containers/404';
// import LogInPage from '../Containers/LogIn';

const Chat = React.lazy(() => import('../Containers/Chat/Chat'));
const LogInPage = React.lazy(() => import('../Containers/LogIn'));
const PageNotFound = React.lazy(() => import('../Containers/404'));


function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<LoadContainer><Loader type="Triangle" color="#00BFFF" /></LoadContainer>}>
          <Switch>
            <Route path="/login" exact component={LogInPage} ></Route>
            <Route path="/chat" exact component={Chat}></Route>
            <Redirect exact from='/' to='/login' />
            <Route path='/404' exact component={PageNotFound} />
            <Route exact>
              <Redirect to='/404'/>
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </>
  );  
}

export default App;

const LoadContainer = styled.div` 
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
