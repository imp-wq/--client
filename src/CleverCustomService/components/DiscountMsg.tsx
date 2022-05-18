import React from "react"


const DiscountMsg=({data})=>{
  const {discount,totalNum}=data
  return (
      <div className='tips'>
          <p>我们的优惠规则是:</p>
          <p>当已成交金额达到:</p>
          <ul>
            <li>10000-20000: 9折</li>
            <li>20000-30000: 8.5折</li>
            <li>30000以上: 7折</li>
          </ul>
          <p>您现在的已成交金额为:{totalNum}</p>
          <p>可享受的折扣为:{discount}</p>
      </div>
  )
}

export default DiscountMsg