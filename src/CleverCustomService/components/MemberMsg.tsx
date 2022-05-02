import React from "react"

const MemberMsg=props=>{
  const {orderNum,MemberQuality}=props
  return (
      <div className='tips'>
            <p>您已完成{props.orderNum}订单</p>
            {orderNum>=MemberQuality?(
            <p>您已完成{orderNum}单，已是我们的会员！可享受优惠和退货服务</p>)
            :
            (<p>您还不是我们的会员，还差{MemberQuality-orderNum}单可以成为会员</p>)}
        </div>
  )
}

export default MemberMsg