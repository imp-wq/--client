import React,{useState}from 'react'
import { Modal,Input } from 'antd'
import updateOrderStatus from '../../../utils/updateorderstatus';

export default function Refund({closeBtn,id,showModal,shutDownModal}) {
  const [refundReason,setRefundReason]=useState('')
  const sendRequest=()=>{
    console.log(id)
    console.log(refundReason)

    if(refundReason==='') {
      console.log('输入为空')
      return
    }
    updateOrderStatus(id,{
      status:'已退货',
      refundReason
    }).then(()=>{
      closeBtn()
    })
    
  }
  return (
    <Modal onOk={()=>{sendRequest()}} visible={showModal} onCancel={shutDownModal}>
    退货理由：<Input status={refundReason===''?'error':''} value={refundReason} onChange={(e)=>{setRefundReason(e.target.value)}}/>
    </Modal>
  )
}
