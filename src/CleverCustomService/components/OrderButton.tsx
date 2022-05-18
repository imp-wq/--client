import React from 'react'
import {SuggestionContainer,SuggestionWrapper,Label,Suggestions} from '../../Containers/Chat/SelectedChat'
import { Messages, OrderSuggestions, SelectedChatProp} from '../../components/Types'
import { Badge } from 'antd';


const OrderList=({context})=>{
    const {message,locale,BotSuggestions,user,to,socket}=context
//   // 订单按钮
     const orderListDOM=
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
  // 订单按钮结束
  return orderListDOM
}

export default OrderList