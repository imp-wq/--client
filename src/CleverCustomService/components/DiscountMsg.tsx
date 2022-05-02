import React from "react"


const DiscountMsg=props=>{
  const {orderNum,MemberQuality,discount}=props
  return (
      <div className='tips'>
            {props.orderNum>=MemberQuality?
            (<p>您是我们的会员,可享受<strong>{discount}</strong>折优惠！</p>)
            :
            (<p>抱歉，您还不是我们的会员，无法享受折扣，可输入<strong> 会员 </strong>查看会员信息</p>)}
        </div>
  )
}

export default DiscountMsg