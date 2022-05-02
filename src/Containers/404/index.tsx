import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

const PageNotFound = () => {
    document.title = '404 PAGE'
    return(
        <Container>
            <Header>Error 404</Header>
            <Copy>The page you are looking for does not exist.</Copy>
            <Link href="http://localhost:3000/login">Go to login page</Link>
        </Container>
    )
}

export default withRouter(PageNotFound);

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    display:flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const Header = styled.div`
    font-size: 5rem;
    font-weight: bold;
`;

const Copy = styled.div`
    font-size: 2rem;
`;

const Link = styled.a`

`;