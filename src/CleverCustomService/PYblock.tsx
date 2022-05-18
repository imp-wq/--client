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
                axios.get('http://localhost:5000/discount',{params:{id:user.id}}).then(({data:res})=>{
                    // setState(JSON.parse(res))
                    setState(res)
                })
                break
            } 
            // case 'Cancel': {
            //     axios.get('http://localhost:5000/member',{params:{email:user.id}}).then(({data:res})=>{
            //         setState(JSON.parse(res))
            //     })
            //     break
            // }  
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
        // <MemberMsg orderNum={state.message} MemberQuality={MemberQuality}/>
        <DiscountMsg data={state}/>
    )
    case 'Discount': return (
        <DiscountMsg data={state}/>
    )
    // case 'Cancel': return (
    //     <CancelMsg orderNum={state.message}  MemberQuality={MemberQuality} chance={1}/>
    // )
    default: return <div className='tip'>
        <p>您好，我是智能客服。</p>
        <p>输入<strong>'订单'</strong>查询订单信息</p>
        <p>输入<strong>'物流'</strong>查询物流信息</p>
        <p>输入<strong>'会员/优惠'</strong>查询会员和优惠的规则</p>
        <p>也可以点击底部按钮对订单进行相关操作</p>
    </div>
    
  }
}

export default PYblock