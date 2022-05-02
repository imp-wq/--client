import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import socketLink from '../../socketContext'
import { Avatar, Badge } from 'antd';
import SelectedChat from './SelectedChat';
import { Messages, User, Online } from '../../components/Types';
import { useBeforeunload } from 'react-beforeunload';
import FetchData from '../../utils/DataFetch';
import store from '../../app/state/store';
import styled from 'styled-components';
import SearchIcon from '../../Assets/icons/search';
import axios from 'axios';
import ForceUserOut from '../../utils/ForceUserOut'
import getCookie from '../../utils/getCookie';
import Navigation from '../../components/Navigation/';
import NavIcon from '../../components/Navigation/icons';

// Delete Cookie, Clear localstorage and redirect user to the login page

let socket: any
const Chat = (props:any) => {
    document.title = 'Chat Page'
    const [messages, setMessages] = useState<Messages[]>([])
    const [unread, setUnread] = useState<Messages[]>([])
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [searchUsers, setSearchUsers] = useState<User[]>([])
    const [user, setUser] = useState<User>({ id: '', username: ''})
    const [selected, setSelected] = useState<string>('')
    const [toUser, setToUser] = useState<User | null>(null)
    const [online, setOnline] = useState<(Online)[]>([{ id: '', date: '', status: false }]);
    const { language } = store.getState();
    const [locale, setLocale] = useState(language);
    const [visibleNav, setVisibleNav] = useState(false);
    let { SuggestedLinks } = require('../../utils/Suggestions');
    let [botOptions, setBotOptions] = useState(SuggestedLinks);

    setInterval(()=> {
       let { SuggestedLinks } = require('../../utils/Suggestions');
       setBotOptions(SuggestedLinks);
    }, 2000);


    //now time to recode this file.
    useEffect(() => {

        const { id, username } = JSON.parse(localStorage.getItem('userData') || '{}');

        if(id && username && id.trim() !== '' && username.trim() !== '')  {
            axios.get('http://localhost:5000/Verify',{
                headers:{
                    auth: getCookie('jwt')
                },
                params:{
                    email: id
                }
            }).then( result => {
                const { status } = result;

                if(status === 200) {
                    store.dispatch({ type: "SIGN_IN", payload:{
                        email: id,
                        name: username
                    }});
    
                    setUser({id, username})
                }

                if (status === 401) {
                    alert('There was a problem verifying your account. Please log in.');
                    ForceUserOut();
                }
                
            }).catch( err => {
                alert('There was a problem verifying your account. Please log in.');
                ForceUserOut();
            });

        } else {
            ForceUserOut();
        }


        
        //socketLink Functions
        socket = io(socketLink) 

        //join user and customer service in the server
        socket.emit('join', {id: 'Customer Service', username: 'Customer Service'})
        socket.emit('join', { id, username })

        socket.on('joined', (data: User) => {
            socket.emit('getmessages', id) //move messages to DB?
            socket.emit('allusers')
            socket.emit('online', id)
            socket.emit('unread', id)
        })
        socket.on('message-server', (smessages: Messages[]) => {
            console.log(smessages)
            setMessages(smessages)
        })
        socket.on('unread-server', (unread: Messages[]) => {
            setUnread(unread)
        })

        socket.on('serverallusers', (users: User[]) => {
            setAllUsers(users)
            setSearchUsers(users)
        })
        socket.on('receivedData', (data: User) => {
            setToUser(data)
        })

        socket.on('serverOnline', (data: []) => {
            setOnline(data)
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
        FetchData();

    }, [props.history])
   

    const selectedFun = (id: string) => {
        socket.emit('userdata', { id, userId: user.id })
        setSelected(id)
    }

    const showContacts = (suser: User, index: number) => {
        const handleName = () => {
           if(suser.username === "Customer Service" && locale === "Chinese"){
            return <NameTag>客户服务</NameTag>
           } else {
            return <NameTag>{suser.username}</NameTag>
           }
        }

        return (
            <ContactItem onClick={() => selectedFun(suser.id)} style={{backgroundColor: selected === suser.id ? "#1890ff": "#2d2d5f6b"}} key={index}>
                <AvaterContainer>
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" alt="profile"/>
                </AvaterContainer>

                <ContactName>
                   {handleName()}
                </ContactName>

                <div className="unread ml-auto">
                    <Badge count={unread.filter(r => (((r.senderId === suser.id) && (r.to === user.id)) && (r.senderId !== selected))).length} />
                </div>
            </ContactItem>
        )
    }

    const onSearchChange = (value: string) => {
        if (allUsers.length > 0) {
            const arr = allUsers.filter(user => {
                if (user.username.startsWith(value))
                    return user
                return null
            })
            setSearchUsers(arr)
        }
        setSelected('')
    }

    const handleLocaleChange = (newLocale:any) => {
        setLocale(newLocale);
    }

    const handleLogOut = () => {
        store.dispatch({type: "RESET_APP"});
        ForceUserOut();
    }

    return (
        <PageContainer>
            <NavIcon handleClick={() => setVisibleNav(true)} isVisible={!visibleNav}/>
            <Navigation isVisible={visibleNav} closeBtn={() => setVisibleNav(false)} logOut={() => handleLogOut()} language={locale} refreshMessages={() => setMessages([])} currentLocale={(item: string)=> handleLocaleChange(item)} numbers={botOptions.English}></Navigation>
            <ChatWrapper>
                { useBeforeunload(() => socket.emit('rmonline', user.id))}
                <ContactColumn>
                    <UpperBox>
                        <SearchBar>
                            <SearchInput
                                placeholder="search contacts"
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <IconWrapper>
                                <SearchIcon />
                            </IconWrapper>
                        </SearchBar>
                    </UpperBox>
                    {searchUsers.length > 0 && searchUsers.map( (suser, index) => (
                        suser.id !== user.id &&
                        showContacts(suser, index)
                    ))}
                </ContactColumn>
                {
                    selected !== '' 
                    && 
                    <SelectedChat 
                        messages={messages} 
                        user={user} 
                        online={online.filter(o => o.id === selected)[0]} 
                        to={selected} 
                        toUser={toUser}  
                        locale={locale}  
                        BotSuggestions = {botOptions}
                    />
                }
            </ChatWrapper>
        </PageContainer>
    )
}

export default Chat


const PageContainer = styled.div`
    height: 100vh;
    background-color: #5b5b94;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media screen and (max-width: 1025px){
        align-items: center;
    }
`;

const ChatWrapper = styled.div`
    padding 1.5rem 0 .5rem 0;
    height: 80%;
    width: 65%;
    border: 1px solid black;
    background-color: #1e1e40;
    border-radius: 20px 20px;
    margin: 2rem 0 0 5rem;
    display: flex;
    flex-direction: row;

    @media screen and (max-width:1200px) {
        width: 60%;
        margin-left: 3rem;
    }

    @media screen and (max-width: 1025px){
        width: 85%;
        margin: 5rem 0 0 0;
    }


    @media screen and (max-width: 700px) {
        width: 95%;
        height: 85%;
        margin-top:3rem;
        flex-direction: column;
    }
`;

const ContactItem = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90%;
    height: 70px;
    margin: 1rem auto;
    background-color: #2d2d5f6b;
    border-radius: 10px 10px;
    padding: 0px 5px;

    &:hover{
        background-color: #2d2d5fb0;
        transition: .5s;
        cursor: pointer;
    }
`;

const AvaterContainer = styled.div`
    display: flex;
    justify-content: center;
    padding-top: 5px;
    width: 60px;
    height:60px;
    border-radius: 50%;
    background-color: #5b5b94;
    margin: 0 15px 0 0;
`;

const ContactName = styled.div`
    height: 100%;
    padding-top: 10px;
    font-size: 14px;
`;

const NameTag = styled.strong`
    color: whitesmoke;
`;

const SearchInput = styled.input`
    width: 100%;
    height: 40px;
    padding: 10px;
    border-radius: 10px 10px;
    border: 0;
    outline: none;
    background-color: #2d2d5f6b;
    color: lightgray;
    padding-left: 35px;

    &::placeholder{
        color: gray;
    }

    @media screen and (max-width: 700px){
        width: 95%;
    }
`;

const ContactColumn = styled.div`
    border-right: 1px solid #d3d3d33d;
    height: 100%;
    min-width: 287px;
    padding-left: 10px;

    @media screen and (max-width: 1200px) {
        min-width: 210px;
    }

    @media screen and (max-width: 700px){
        height: 50%;
    }
`;

const UpperBox = styled.div`
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SearchBar = styled.div`
   position: relative;
   width: 80%;
   margin: 0 auto;

   @media screen and (max-width: 1000px) {
       width: 180px;
   }

   @media screen and (max-width: 700px){
       width: 100%;
       margin-left: 2rem;
   }
`;

const IconWrapper = styled.div`
    position: absolute;
    top:0;
    left: 0;
    margin: 5px;
    width: 20px;
`;
