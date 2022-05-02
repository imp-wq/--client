import React, { createRef, useEffect, useRef, useState} from 'react'
import styled from 'styled-components';
import { Messages, BotResponse, OrderSuggestions, Order, SelectedChatProp as Prop} from '../../components/Types'
import { Button } from 'antd'
import { Element } from 'react-scroll' 
import isJson from '../../utils/isJson';
import ViewOrder from '../../components/Modals/ViewOrder';
import NewOrderModal from '../../components/Modals/NewOrder';
import socketLink from '../../socketContext';
import io from 'socket.io-client';
import store from '../../app/state/store';
import AttachmentIcon from '../../Assets/icons/attachments';
import { Badge } from 'antd';

// // 引入智能客服组件
import PYblock from '../../CleverCustomService/PYblock'

const axios = require('axios').default;

let socket: SocketIOClient.Socket;
socket = io(socketLink);

declare module 'react' {
    interface HTMLAttributes<T> {
        action?: String,
        handleAttachment?:() => void,
        language?: string,
        isSystemMessage?: boolean
    }
}



const SelectedChat = ({ messages, user, online, to, toUser, locale, BotSuggestions}: Prop) => {
    const [userMessages, setUserMessages] = useState<(Messages | null)[]>()
    const [value, setValue] = useState<any | null>('')
    const btnRef = createRef<HTMLButtonElement>()
    const [orderDetails, setOrderDetails ] = useState<Order | any>()
    const [viewOrderModal, setViewOrderModal ] = useState(false);
    const [newOrderModal, setNewOrderModal] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [schematicFiles, SetSchematicFiles] = useState<Array<any>>([]);
    const [schematicAddition, setSchematicAddition] = useState<Array<string>>([])

    useEffect(() => {
        console.log(messages, 'tj debugging');
        let msgs = messages.map(message => {
            if ((message.senderId === user.id && message.to === to) || (message.senderId === to && message.to === user.id))
                return message
            return null
        })
        msgs = msgs.filter(msg => msg !== null)
        setUserMessages(msgs)
        if (to !== '')
            filterSelected(user.id, to)
        
        scrollToTheBottom();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, to])
 
    useEffect(() => {
        removeUnread(user.id, to)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [to])

    const sendMessage = (senderId: string, username: string, message: string, to: string) => {
        socket.emit('message-client', { senderId, username, message, to, date: new Date(), language: locale })
    }

    const removeUnread = (userId: string, to: string) => {
        socket.emit('rmunread', { userId, to })
    }

    const filterSelected = (userId: string, to: string) => {
        socket.emit('rmunread', ({ userId, to }))
    }

    const sendMessageInput = () => {
        if (value !== '')
            sendMessage(user.id, user.username, value, to)

        setValue('')
    }

    const scrollToTheBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
        }, 500);
    }

    const getDateTime = (date: string) => {
        var today = new Date(date);
        return `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}  ${(today.getHours() + 24) % 12 || 12}:${today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes()}`
    }

    const handleAddSchematic = async (id: any) => {
        console.log(schematicAddition, 'addition', schematicFiles, 'files');

        const formData = new FormData();
        for(let i=0 ; i < schematicFiles.length ; i++){
            formData.append('file', schematicFiles[i]);
        }
        axios.post(`/upload/${user.id}`, formData);
        
        await axios.put('http://localhost:5000/addSchematic', {
            params: {
                email: user.id,
                projectId: id,
                schematics: schematicAddition
            }
        }).then((result:Order) => {
            store.dispatch({type: "ADD_SCHEMATIC", payload: {
                id: id, 
                schematics: schematicAddition
            }});

            socket.emit('message-client', { 
                senderId: 'Customer-Service-auto', 
                username: user.username, 
                message: locale === "English" ? `Your schematic has been successfully added to the order. Is there anything else I can do for you?` : "您的原理图已成功添加到订单中。我还有什么可以为您做的吗？", 
                to: user.id, 
                date: new Date(),
                language: locale
            })
        })
    }

    const handleListClick = (List: Order) => {
        switch(List.action) {
            case "Delete":   
                let proceed = window.confirm(locale === 'English' ? ` Are you sure you want to delete this order:  ${value}` :`
                您确定要删除此订单吗 ${value}` );
                proceed && axios.delete('/getOrder', {
                    data: {
                        user: user.id,
                        value: List.id
                    }
                }).then( (result:any) => {
                    store.dispatch({type: "DELETE_ORDER", payload: List.id});

                    socket.emit('message-client', { 
                        senderId: 'Customer-Service-auto', 
                        username: user.username, 
                        message: locale === "English" ? `Your order successfully deleted. Is there anything else I can do for you?`: "您的订单已成功删除。我还有什么可以为您做的吗？", 
                        to: user.id, 
                        date: new Date(),
                        language: locale
                    })
                }).catch( (err:any) => {
                    console.log(err);
                })
              break;
            case "View":
                setOrderDetails(List);
                setViewOrderModal(true);
              break;
            case "Edit":
                break;
            case "ADD_SCHEMATIC":
                let proceedAlert = window.confirm(locale === 'English' ? ` Are you sure you want to add this schematic (${List.id}) to this project?` : `您确定要将此原理图添加到该项目中吗？: ${List.id}` );
                if(proceedAlert) handleAddSchematic(List.id);
                break;
            case "Suggest":
                sendMessage(user.id, user.username, List.text, to);
                break;
            default:
                return;
          }
    }

    const createList = (List: Array<any>) => {
        return List.map((i, index) => {
            return <ListOptions key={index} onClick={() => handleListClick(i)}>
                <TextWrapper>
                    <ListLabel>{i.action !== 'Suggest' && 'id:'} {i.id || i._id ? i.id || i._id : i.text}</ListLabel>
                    <ListDescription> {i.action !== 'Suggest' && (locale === "English" ? "Description:" : "描述:")} {i.description ? i.description : null}</ListDescription>
                </TextWrapper>
                <ImgWrapper>
                    {
                        i && i.schematics && i.schematics[0] &&
                        <SchematicImg 
                            key={index}
                            src={require(`../../../../server/public/uploads/${user.id}/${i.schematics[0]}`)}
                            alt={i.description} 
                        />
                    }
                </ImgWrapper>
            </ListOptions>
        })
    }

    const handleBotResponse = (answer:BotResponse) => {
       if( answer.type === 'list' ) {
        return <div>
            {answer.text}
            <ListContainer>
                {createList(answer.list)}
            </ListContainer>
        </div>
       }
       return answer.text;
    }

    const showMessages = () => {
        if (userMessages && userMessages.length > 0) {
            return userMessages.map((message, index) => (
                message && message.senderId === user.id ?
                    <RightSide key={index}>
                        <Message>
                            <div className="time text-right">
                                <div className="d-flex align-items-center">
                                    <strong>{message.username}</strong>
                                    <small className="ml-2 text-muted">{getDateTime(message.date)}</small>
                                </div>
                            </div>
                            {message.message}
                        </Message>
                    </RightSide>
                    : 
                    <LeftSide isSystemMessage = {message?.system === true ? true : false} key={index}>
                        <Message>
                            <div className="time text-right">
                                <div className="d-flex align-items-center">
                                    <strong>  {message && message.username}</strong>
                                    <small className="ml-2 text-muted">{message && getDateTime(message.date)}</small>
                                </div>

                            </div>
                            <Element  name="messageBox" id="messageBox" className="element">
                                {message &&  (
                                        message.senderId === "Customer Service" && isJson(message.message)?
                                        handleBotResponse(JSON.parse(message.message))
                                        : message.message
                                )}
                            </Element>

                            <Element  name="messageBox" id="messageBox" className="element">
                                {/* 智能客服相关显示 */}
                                <div><strong>智能客服:</strong></div>
                                <PYblock context={{message, locale, BotSuggestions, user, to, socket}}/>
                            </Element>
                        </Message>
                    </LeftSide>
            ))
        }
    }

    socket.on("NewOrderModal", () => {
        setNewOrderModal(true);
    });

    return (
        <>
            <MessageSection className='messageSection'>
                <UpperBox>
                    <Title><strong>{toUser && toUser.username}</strong>
                        <div className="d-flex text-muted">
                            <div className="online">
                                {to === "Customer Service" ? 'online' : <small>{online.status ? 'Online' : 'Offline'}</small>}
                            </div>
                        </div>
                    </Title>
                </UpperBox>

                <div className="mbody mb-3 mt-1 px-2" 
                    id="mbody" 
                    style= {{
                        height:`${toUser?.username === "Customer Service" ? '350px' : '415px'}`
                    }}>
                    {showMessages()}
                    <div ref={messagesEndRef} />
                </div>
                {toUser?.username === "Customer Service" ? 
                    <SuggestionContainer>
                        <Label language={locale}>{locale === "English" ? 'Suggestions:' : '建议:' }</Label>
                        <SuggestionWrapper>
                            {locale === "English" ? 
                            BotSuggestions.English.map((item: OrderSuggestions) => {
                                return <Suggestions value={item.text} onClick={e => {
                                    const message = e.currentTarget.getAttribute('value');

                                    socket.emit('message-client', { 
                                        senderId: user.id, 
                                        username: user.username,
                                        message,
                                        to, 
                                        date: new Date(), 
                                        language: locale })
                                
                                }}>
                                    {item.text}
                                    {item.countable === true ? <Badge count={item.number} size="small" offset={[10, -18]} showZero/> : null}
                                </Suggestions>
                            })
                            :
                            BotSuggestions.Chinese.map( (item: OrderSuggestions, index: number) => {
                                return <Suggestions key={index} value={item.text} onClick={ e => {
                                    const message = e.currentTarget.getAttribute('value');

                                    socket.emit('message-client', { 
                                        senderId: user.id, 
                                        username: user.username,
                                        message,
                                        to, 
                                        date: new Date(), 
                                        language: locale })
                                }}>
                                    {item.text}
                                    {item.countable === true ? <Badge count={item.number} size="small" offset={[10, -18]} showZero/> : null }
                                </Suggestions>
                            })
                            }
                        </SuggestionWrapper>
                    </SuggestionContainer> 
                : null}

                <MessageContainer>
                    <MessageBar>
                        <IconWrapper>
                            <AttachmentIcon 
                                handleAttachment={ (e:any) => {
                                    if(e.target.name === "schematics"){
                                        let PathString = [];
                            
                                        for(let i =0; i < e.target.files.length; i++){
                                            PathString.push(e.target.files[i].name);
                                        }  
                                        SetSchematicFiles(e.target.files);
                            
                                        socket.emit('message-client', { 
                                            senderId: user.id, 
                                            username: user.username,
                                            message: locale === "English" ? 'Add Image': '加图片',
                                            to: "Customer Service", 
                                            date: new Date(), 
                                            language: locale 
                                        });
                            
                                        setSchematicAddition(PathString);
                                    }
                                }}
                            />
                        </IconWrapper>
                        <SearchInput 
                            placeholder="Type message here" 
                            name="msginput" autoComplete="off" 
                            className="mr-2" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                            onKeyPress={(e) => {
                                if( e.key === "Enter") 
                                    sendMessageInput();
                            }} 
                        />
                        <Button type="primary" ref={btnRef} onClick={sendMessageInput}>Send</Button>
                    </MessageBar>
                </MessageContainer>
            </MessageSection>
            {
                viewOrderModal 
                && 
                <ViewOrder 
                    details={orderDetails} 
                    closeBtn={() => setViewOrderModal(false)} 
                    locale={locale} 
                    user={user} 
                    orderDetails={orderDetails}
                />
            }
            {
                newOrderModal && <NewOrderModal 
                user={user} 
                closeBtn = {() => setNewOrderModal(false)} 
                locale={locale}
            />
            }
        </>
    )
}

export default SelectedChat

const ListContainer = styled.ul`
    padding: 10px;
`;

const ListOptions = styled.li`
    display: flex;
    flex-direction: row;
    width: 320px;
    height: 70px;
    color: gray;
    list-style: none;
    margin: 10px 0;
    padding: 5px 10px;
    border-radius: 10px 10px;
    line-height: 15px;
    background-color: #2d2d5f6b;

    &:hover{
        cursor: pointer;
        background-color: #505086;
        transition: .5s;
        color: black
    }

    &:first-child {
        margin-top: 20px;
    }
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

`;
const ListLabel = styled.div`
    color: whitesmoke;
    white-space: nowrap;
`;

const ListDescription = styled.div`
    margin: 5px 0;
    color: gray;
    font-size: 12px;
`;

const ImgWrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

const SchematicImg = styled.img`
    width: 50px;
    height: 50px;
    margin: 2px;
    margin-left: 20px;
    border: 1px solid #1890ff;

    &:hover{
        transition: .5s;
        outline: 2px solid lightblue;
    }
`;


const SearchInput = styled.input`
    width: 85%;
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
`;

const MessageBar = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
`;

const MessageContainer = styled.div`
    position:absolute;
    width:100%;
    bottom:10px;
    margin:0 5px;

    @media screen and (max-width: 1180px) {
        width: 95%;
    }
`;
const IconWrapper = styled.div`
    position: absolute;
    top:0;
    left: 0;
    margin: 5px;
    width: 20px;
`;

const RightSide = styled.div`
    margin-left: auto;
    margin-bottom: 1rem;
    margin-top: 1rem;
    border-radius: 10px 10px;
    background-color: #1890ff;
    display: table;
    max-width: 310px;
    padding: 10px;
    position: relative;
`;

const LeftSide = styled.div`
    border-radius: 10px 10px;
    background-color: ${props => props.isSystemMessage ? '#e6c1596b':'#2d2d5f6b'} ;
    display: table;
    max-width: 310px;
    padding: 10px;
    position: relative;
    margin-top: 1rem;
    margin-bottom: 1rem;
`;

const Message = styled.div`
    font-size: 14px;
    color: whitesmoke;
`;

const UpperBox = styled.div`
    height: 70px;
    border-bottom: 1px solid #e7e7e7;
    display: flex;
    align-items: center;
    padding-left: 10px;
`;

const Title = styled.div`
    font-size: 14px;
    color: whitesmoke;
`;

const MessageSection = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`;

const SuggestionContainer = styled.div`
    width: 95%;
    position:absolute;
    // min-width: 400px;
    height: 50px;
    background-color: #2d2d5f6b;
    left: 10px;
    border-radius: 10px 10px;
    padding: 5px;
    display: flex;
    align-items: center;
    overflow: auto;
    &::-webkit-scrollbar {
        display: none;
    }

    @media screen and (max-width: 700px){
        bottom: 60px;
    }
`;

const Label = styled.label`
    color: whitesmoke;
    font-size: 20px;
    min-width: ${ props => props.language === "English" ? '120px' : '60px'};
    padding-left: 5px;
    margin: 0;
`;

const SuggestionWrapper = styled.ul`
    display: flex;
    flex-direction: row;
    list-style: none;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
   

`;
const Suggestions = styled.li`
    display: flex;
    align-items:center;
    border: #1e1e40 1px solid;
    border-radius: 10px 10px;
    height: 30px;
    padding: 0 10px;
    margin: 0 5px;
    color: white;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    background-color: #3a3a6b;
    white-space: nowrap;

    &:hover{
        background-color: #505086;
        transition:.5s;
    }
`;

export {SuggestionContainer,SuggestionWrapper,Label,Suggestions}

