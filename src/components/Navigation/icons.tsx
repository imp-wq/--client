import React from 'react';
import styled from 'styled-components';

interface Props {
    handleClick: () => void,
    isVisible: boolean
}

const NavIcon = (props: Props) => {
    return(
        <Container onClick={() => props.handleClick()} visible={props.isVisible ? true : false}>
            <Lines/>
            <Lines/>
            <Lines/>
        </Container>
    )
}

export default NavIcon;

const Container = styled.div`
  width: 50px;
  height: 50px;
  display: ${props => props.visible ? 'flex': 'none'};
  flex-direction:column;
  position: absolute;
  top: 20px;
  right: 20px;
  margin: 0 50px;
  display: none;
  cursor: pointer;

  &:hover > div {
    background-color: lightgray;
    transition: 0.5s;
  }

  @media screen and (max-width: 1025px){
      display: ${props => props.visible ? 'flex': 'none'};
  }
`;

const Lines = styled.div`
    height: 28%;
    margin: 5px 0;
    background-color: white;
    border-radius: 10px 10px;
`;