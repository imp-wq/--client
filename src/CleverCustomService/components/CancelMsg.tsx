import React,{useState} from "react"


// 退货策略：有3单允许退1单
const CancelMsg=props=>{
  const {orderNum,MemberQuality,chance}=props
  // 0未选择，1退货，2不退
  const [state,setState]=useState(0)
  const style={
    color: '#000'
  }
  const choiceButton=()=>{
    switch(state) {
      case 0:return <div><span>是否退货？</span><button style={style} onClick={()=>{setState(1)}}>是</button><button style={style} onClick={()=>{setState(2)}}>否</button></div>
     case 1:return <p>已将您的退货信息发送给客服！您还剩<strong> {chance-1} </strong>次退货机会</p>
     case 2:return <p>退货已取消</p>
      }
  }
  return (
      <div className='tips'>
            <p>您已完成{props.orderNum}订单</p>
            {orderNum>=MemberQuality?(
              <div>
                 <p>您有<strong> {chance} </strong>次退货机会</p>
                 {
                   choiceButton()
                 }
              </div>)
              : 
            (<p>抱歉，您还不是我们的会员，无法享受退货服务，可输入<strong> 会员 </strong>查看会员信息</p>)}
        </div>
  )
}

export default CancelMsg