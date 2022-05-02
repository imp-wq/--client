import React, { useEffect } from 'react';
import styled from 'styled-components';
import store from '../../app/state/store';

interface LanguageProps {
    currentLocale: (item:any) => void,
    operatingLanguage: string,
    refreshMessages: () => void
}

const LanguageToggle = ( props: LanguageProps ) => {
    const { language } = store.getState();

   useEffect(() => {
    
   })
    return(
        <Wrapper>
            <LanguageHeading> 
                <Label>{props.operatingLanguage === "Chinese" ? 'Language' :'语言'}</Label>

                <LanguagesOptions>
                    <Item onClick={async () => {
                            if(props.operatingLanguage !== "Chinese") {
                                await store.dispatch({type: "CHANGE_LANGUAGE", payload: "Chinese"});
                                props.currentLocale("Chinese");
                                props.refreshMessages();
                            }
                    }}>Chinese</Item>
                    <Item onClick={
                        async () => {
                            if(props.operatingLanguage !== "English") {
                                await store.dispatch({type: "CHANGE_LANGUAGE", payload: "English"});
                                props.currentLocale("English");
                                props.refreshMessages();
                            }
                    }}>English</Item>
                </LanguagesOptions>
            </LanguageHeading>
            <LocaleFlag src={
                language === "Chinese" ? require('../../Assets/icons/Flags/UK.png') : require('../../Assets/icons/Flags/China.png')
            }/>
        </Wrapper>
    )
}

export default LanguageToggle;

const Wrapper = styled.div`
    display: flex;
    flex-direction: row-reverse;
    width: 230px;
    background-color: #2d2d5f6b;
    border-radius: 10px 10px;
    margin: 15px 30px;
    padding: 5px;
    transition:.5s;
    align-items: center;
    justify-content: center;

    &:hover{
        background-color: #2d2d5f;
        cursor: pointer;
    }

    &:hover div{
        display: flex;
        transition: 1s;
    }

    @media screen and (max-width: 700px){
        margin: 5px;
    }
`;

const LanguageHeading = styled.div`
    height: 40px;
    width: 210px;
    border-radius: 10px 10px;
    background-color: transparent;
    color: whitesmoke;
    border: 0;
    padding: 15px;
    display: flex;
    align-items: center;
    
`;

const LocaleFlag = styled.img`
    height: 50px;
    width: 50px;
`;

const LanguagesOptions = styled.div`
    display: none;
    flex-direction: column;
    position: absolute;
    background-color: #2d2d5f6b;
    width: 230px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    border-radius: 10px 10px;
    top: 75px;
    left: 30px;

    &:hover{
        display: flex;
    }
    
`;

const Item = styled.div`
    height: 50px;
    padding: 10px;
    border-radius: 10px 10px;
    
    &:hover{
        background-color: #2d2d5f;
        cursor: pointer;
    }
`;

const Label = styled.strong`
`;
