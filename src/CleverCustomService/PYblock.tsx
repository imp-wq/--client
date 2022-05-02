import { Messages, OrderSuggestions, SelectedChatProp} from '../components/Types'
import React, { useEffect, useState } from 'react'
import {SuggestionContainer,SuggestionWrapper,Label,Suggestions} from '../Containers/Chat/SelectedChat'
import { Badge } from 'antd';
import axios from 'axios';
import './table.css'
import './style.css'
import OrderButton from './components/OrderButton'
import DeliveryInfoTable from './components/DeliveryInfoTable'
import MemberMsg  from './components/MemberMsg'
import DiscountMsg from './components/DiscountMsg'
import CancelMsg from './components/CancelMsg'

// 用户信息格式：{id: '1234567@qq.com', username: 'wzy'}
// PYmessage为从Python模块发来的信息，用于进行功能的分支判断

// 需要完成3个订单才能退货
const MemberQuality=3

// const PYblock = ({message: Messages | null,locale:String,{BotSuggestions,user,to},socket}) => {
const PYblock = ({context}) => {
    const {message,locale,BotSuggestions,user,to,socket}=context
   
    // 保存请求到的信息
    const [state,setState]:Array<any>=useState([])
    useEffect(()=>{
        switch(message.PYmessage) {
            case 'deliveryInfo': { 
                axios.get('http://localhost:5000/deliveryInfo',{params:{email:user.id}}).then(({data:res})=>{
                    setState(JSON.parse(res))
                })
                break
            }
            case 'Member': {
                axios.get('http://localhost:5000/member',{params:{email:user.id}}).then(({data:res})=>{
                    setState(JSON.parse(res))
                })
                break
            }
            case 'Discount': {
                axios.get('http://localhost:5000/member',{params:{email:user.id}}).then(({data:res})=>{
                    setState(JSON.parse(res))
                })
                break
            } 
            case 'Cancel': {
                axios.get('http://localhost:5000/member',{params:{email:user.id}}).then(({data:res})=>{
                    setState(JSON.parse(res))
                })
                break
            }  
            default: return
        }
            
        
    },[message.PYmessage, user.id])

  if (!message) return
  switch (message.PYmessage) {
    case 'Orders': return <OrderButton context={context}/>
    case 'deliveryInfo': {
        // console.log(state)
        return <DeliveryInfoTable data={state}/>
    }
    case 'Member': return (
        <MemberMsg orderNum={state.message} MemberQuality={MemberQuality}/>
    )
    case 'Discount': return (
        <DiscountMsg orderNum={state.message}  MemberQuality={MemberQuality} discount={7}/>
    )
    case 'Cancel': return (
        <CancelMsg orderNum={state.message}  MemberQuality={MemberQuality} chance={1}/>
    )
    default: return <h2>智能客服不明白</h2>
  }
}

export default PYblock