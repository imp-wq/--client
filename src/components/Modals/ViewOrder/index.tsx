import React, {useState} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { User } from '../../Types';
import EnlargeImage from './EnlargeImage';

import io from 'socket.io-client';
import socketLink from '../../../socketContext';
import store from '../../../app/state/store';

const socket = io(socketLink);

interface Order {
    id: String,
    quantity: Number,
    eta: String,
    action: String,
    schematics: Array<any>,
    text: string
}

interface Props {
    closeBtn: () => void,
    details: any,
    locale: string,
    user: User,
    orderDetails: Order
}

interface Order {
    id: String,
    quantity: Number,
    eta: String,
    action: String,
    schematics: Array<any>
}

declare module 'react' {
    interface HTMLAttributes<T> {
        src?: String,
    }
}

interface Schematic {
    name: String,
    size: Number,
    type: String
}

const checkType = (file: String) => {
    let type = [];
    if( file.length !== 0){
        for(let i=0; i < file.length; i++){
            if(file[i] === '.'){
                for( let j=i+1; j < file.length; j++){
                    type.push(file[j]);
                }
            }
        }
    }
    return type.join('');
}

const ViewOrderModal = ({ closeBtn, details, locale, user, orderDetails }: Props) => {
    const { id, quantity, eta, schematics, description, currentProcess, surface, thickness } = details;
    const [showEnlarge, setShowEnlarge] = useState(false);
    const [imgPath, setImgPath] = useState('');
    const {users: {userEmail}} = store.getState();

    const deleteOrder = () => {
        let proceed = window.confirm(locale === 'English' ? ` Are you sure you want to delete this order:  ${orderDetails.id}` :`您确定要删除此订单吗: ${orderDetails.id}` );
                proceed && axios.delete('/getOrder', {
                    data: {
                        user: user.id,
                        value: orderDetails.id
                    }
                }).then( (result:any) => {
                    store.dispatch({type: "DELETE_ORDER", payload: orderDetails.id});

                    socket.emit('message-client', { 
                        senderId: 'Customer-Service-auto', 
                        username: user.username, 
                        message: locale === "English" ? `Your order successfully deleted. Is there anything else I can do for you?` : "您的订单已成功删除。我还有什么可以为您做的吗？", 
                        to: user.id, 
                        date: new Date(),
                        language: locale
                    })
                }).catch( (err:any) => {
                    alert('there was an error deleting the order');
                }).finally(() => closeBtn())
    }
    return(
        <Container>
            <Wrapper>
                <Close onClick= { closeBtn }>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </Close>
            
                <ContentWrapper>
                    <DetailContainer>
                        <OrderLeft>
                            <DetailLabel>{ locale === "English" ? `Order Description:`: '描述:' }</DetailLabel>
                            <DetailInfo>{description}</DetailInfo>

                            <DetailLabel>{ locale === "English" ? `Current Proccess`: '当前进程:'}</DetailLabel>
                            <DetailInfo>{currentProcess}</DetailInfo>

                            <DetailLabel>{ locale === "English" ? `Thickness`: '厚度:'}</DetailLabel>
                            <DetailInfo>{thickness} mm</DetailInfo>

                            <DetailLabel>{ locale === "English" ? `Surface` :'表面:'}</DetailLabel>
                            <DetailInfo>{surface}</DetailInfo>
                        </OrderLeft>
                        <OrderRight>
                            <DetailLabel>{ locale === "English" ? `item id:`: '物品编号：'}</DetailLabel>
                            <DetailInfo>{id}</DetailInfo>

                            <DetailLabel>{ locale === "English" ? `quantity:` : '数量:'}</DetailLabel>
                            <DetailInfo>{quantity}</DetailInfo>

                            <DetailLabel>{ locale === "English" ? `Time to finish:`: '完成时间'}</DetailLabel>
                            <DetailInfo>{eta}</DetailInfo>

                           
                        </OrderRight>
                        
                    </DetailContainer>

                    <ImgContainer>
                        <hr/>
                        <ImgWrapper>
                            {schematics.map( (i:any, index: any) =>{
                                let FileType = checkType(i);

                                // if (FileType === 'svg'){
                                //     return (
                                //         <SVGCanvas>
                                //             <ToSvg userEmail={userEmail} fileName={i} key={index}/>
                                //         </SVGCanvas>
                                //     )
                                // }

                                return(
                                    <SchematicImg 
                                    key={index}
                                    src={`http://localhost:5000/uploads/${userEmail}/${i}`} 
                                    alt={i.description} 
                                    onClick={() => {
                                        setShowEnlarge(true);
                                        setImgPath(`http://localhost:5000/uploads/${userEmail}/${i}`);
                                    }}
                                />
                                )
                            }
                                
                            )}
                        </ImgWrapper>
                    </ImgContainer>

                    <Delete onClick={() => deleteOrder()}>delete</Delete>
                </ContentWrapper>

                {showEnlarge && <EnlargeImage userEmail= {userEmail} ImgSrc={imgPath} closeBtn={() => setShowEnlarge(false)} />}
            </Wrapper>
        </Container>
    )
}


export default ViewOrderModal;

const DetailLabel = styled.label`
    color: whitesmoke;
    margin-bottom: 0px;
`;

const DetailContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding: 0 30px;
`;

const OrderLeft = styled.div`
    width: 50%;
`;

const OrderRight = styled(OrderLeft)`
    @media screen and (max-width: 1000px){
        overflow: hidden;
    }
`;

const DetailInfo = styled.p`
    margin-bottom: 15px;
    color: black;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 30px 0 0 0px;
`;

const Close = styled.svg`
    position: absolute;
    right: 0;
    margin: 10px 20px 0 0;
    width:20px;
    height: 20px;

    :hover {
        cursor: pointer;
        transition: .5s;
        color: blue;
    }

    path {
        fill: #80868b
    }
`;

const Container = styled.div`
    height: 100%;
    width: 100%;
    background-color: #0000007d;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
`;

const Wrapper = styled.div`
    position: relative;
    width: 55%;
    height: 80%;
    background-color: #545490;
    border-radius: 20px 20px;
    margin-right: 300px;
    

    @media screen and (max-width: 1000px){
        width: 90%;
        height: 80%;
    }

`;

const SchematicImg = styled.img`
    width: 150px;
    height: 150px;
    margin: 2px 20px 5px 0;

    &:hover{
        transition: .5s;
        outline: 2px solid lightblue;
    }
`;

const SVGCanvas = styled.div`
    width: 150px;
    height: 150px;
    margin: 2px 20px 5px 0;

    &:hover{
        transition: .5s;
        outline: 2px solid lightblue;
    }
`;

const ImgContainer = styled.div`
    display: flex;
    margin-bottom: 10px;
    height: 225px;
    background-color: #2d2d5f6b;
    align-items: flex-start;
    flex-direction: row-reverse;
    overflow: auto;
`;

const ImgWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 5px 30px;

`;

const Delete = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    width: 120px;
    margin-top: 10px;
    background-color: #d27e7e;
    border-radius: 10px 10px;
    margin-left: 30px;

    &:hover {
        transition: .5s;
        background-color: #f55656;
        cursor: pointer;
    }
`;