import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import store from '../../app/state/store';

declare module 'react' {
    interface HTMLAttributes<T> {
        visible?: boolean,
        
    }
}



const NavigationContent = ({isVisible, closeBtn, language, currentLocale, refreshMessages, logOut, numbers}: any) => {
    const[languageVisible, setLanguageVisible] = useState(false);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [processingOrders, setProcessingOrders] = useState(0);
    const [user, setUser] = useState(null)

    useEffect(()=> {
        setInterval(async () => {
            const state = await store.getState();
            const {orders, users} = state;
            if(user === null){
                setUser(users.name);
            }
            if(orders && orders.length !== 0){
                updateNumbers(orders);
            }
        }, 2000)
    })

    const updateNumbers = (orders:any) => {
        let pending: number = 0;
        let completed:number = 0;
        let processing:number = 0;

        orders.forEach((item:any) => {

            if (item.currentProcess === "Processing...") {
                processing++;
            } else if(item.currentProcess === "Ready for collection"){
                completed++;
            }else{
                pending++;
            }

        })
        setPendingOrders(pending)
        setCompletedOrders(completed)
        setProcessingOrders(processing)
    }
    return(
        <Container visible={isVisible ? true : false}>
            <Wrapper>
                <UserDetails>
                    <Close onClick= { closeBtn }>
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </Close>
                    <AvatarContainer>
                        <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" alt="profile" />
                    </AvatarContainer>
                        <UserName>{user}</UserName>
                    <LogOut onClick={logOut}>Logout</LogOut>
                </UserDetails>

                {/* <ChangeLanguage onClick={() => setLanguageVisible(!languageVisible)}>
                    <LocaleFlag src={
                    language === "Chinese" ? require('../../Assets/icons/Flags/UK.png') : require('../../Assets/icons/Flags/China.png')
                }/>

                    <Label>{language === "Chinese" ? 'Change Language' :'选择语言'}</Label>
                </ChangeLanguage> */}
                <LanguagesOptions visible={languageVisible}>
                    <Item onClick={async () => {
                            if(language !== "Chinese") {
                                await store.dispatch({type: "CHANGE_LANGUAGE", payload: "Chinese"});
                                currentLocale("Chinese");
                                refreshMessages();
                            }
                    }}>Chinese</Item>
                    <Item onClick={
                        async () => {
                            if(language !== "English") {
                                await store.dispatch({type: "CHANGE_LANGUAGE", payload: "English"});
                                currentLocale("English");
                                refreshMessages();
                            }
                    }}>English</Item>
                </LanguagesOptions>

                <OrderContainer>
                    <OrderHeading>{language === "English" ? "My Orders" : "我的订单"}</OrderHeading>
                    <OrderStatus>
                        <Processing> {processingOrders} </Processing>
                        <Processing>{language === "English" ? 'orders being processed': '个订单正在处理'}</Processing>
                    </OrderStatus>

                    <OrderStatus>
                        <Pending>{pendingOrders}</Pending>
                        <Pending>{language === "English" ? 'orders being produced': '个订单生产中有'}</Pending>
                    </OrderStatus>

                    <OrderStatus>
                        <Completed>{completedOrders}</Completed>
                        <Completed> {language === "English" ? 'orders completed': '个订单已完成'}</Completed>
                    </OrderStatus>
                </OrderContainer>
            </Wrapper>
        </Container>
    )
}

export default NavigationContent;

const Container = styled.div`
    position: absolute;
    right: 0;
    top: 0;

    width: 300px;
    height: 100vh;
    z-index: 1;

    background-color: #000000f5;
    overflow: hidden;

    @media screen and (max-width:1025px) {
        right: ${props => props.visible ? '0' : '-300px'};
    }
`;

const Wrapper = styled.div`
    position: relative;
    height: 100%;
`;

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
    height: 250px;
    background-color: #2d2d5f6b;
    justify-content: center;
    align-items: center;
    position: relative;
`;

const Avatar = styled.img`
    position: relative;
    height: 75px;
    width: 75px;
    margin-bottom: 15px;
`;

const AvatarContainer = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 5px;
    width: 90px;
    height:90px;
    border-radius: 50%;
    background-color: #5b5b94;
    margin:5px 0 15px 0;
`;

const UserName = styled.h4`
    color: #e2e2e2;
    margin: 0 0 1rem 0;
`;

const LogOut = styled.div`
    color: gray;
    cursor: pointer;
    font-size: 20px;
    margin: 5px;

    &:hover {
        color: #ccc8c8;
        transition: 0.5s;
    }
`;
const OrderContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 0 0 0;
    background-color:#2d2d5f6b;
    height: 100%;
`;

const OrderHeading = styled.h3`
    color: whitesmoke;
    text-align: center;
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    margin-bottom: 1rem;
    padding: 10px 0;
    font-size: 1.5rem;
`;

const OrderStatus = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 5px;
`;

const Close = styled.svg`
    position: absolute;
    left: 0;
    top: 0;
    margin: 10px;
    width:30px;
    height: 30px;
    color: white;

    :hover {
        cursor: pointer;
        transition: .5s;
        color: blue;
    }

    path {
        fill:whitesmoke;
    }

    @media screen and (min-width: 1026px){
        display: none;
    }
`;

const Pending = styled.p`
    color: orange;
    font-size: 18px;
    margin-left: 1.5rem;
`;

const Processing = styled(Pending)`
    color: gray;
`;

const Completed = styled(Pending)`
    color: green;
`;

const ChangeLanguage = styled.div`
    height: 80px;
    background-color: #27264e;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    &:hover{
        cursor: pointer;
        background-color: #323161;
        transition: .5s;
    }
`;

const LocaleFlag = styled.img`
    height: 50px;
    width: 50px;
`;

const LanguagesOptions = styled.div`
    display: ${props => props.visible ? 'flex' : 'none'};
    flex-direction: column;
    background-color: #2d2d5f6b;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    top: 75px;
    left: 30px;

    &:hover{
        display: flex;
    }
    
`;

const Item = styled.div`
    text-align: center;
    color: white;
    height: 50px;
    padding: 10px;
    border-radius: 10px 10px;
    
    &:hover{
        background-color: #2d2d5f;
        cursor: pointer;
    }
`;

const Label = styled.strong`
    color: lightGray;
    margin: 0 15px
`;
