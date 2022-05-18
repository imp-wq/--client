import React from "react"
import style from './pay.module.css'

// 付款界面
export default function({price,success,fail}) {
  return (
    <div className={style.container}>
      <div className={style.box}>
        <div className={style.tips}>
          <span>请付款:</span> <span>￥{price}</span>
        </div>
        <button className={style.success} onClick={()=>{success()}}>现在付款</button>
        <button className={style.fail} onClick={()=>{fail()}}>放弃付款</button>
      </div>
    </div>
  )
}