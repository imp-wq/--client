import React from "react"
// 物流信息表格
const table=(props)=>{

  return (
  <div>
      <h4 className="tip">已发货订单:</h4>
      <table>
      <thead>
          <tr>
              <th>订单ID</th>
              <th>承运商</th>
              <th>已到达</th>
          </tr>
      </thead>
      <tbody>
          {props.data.map(item=>
          <tr key={item._id}>
              <td>{item._id}</td>
              <td>{item.deliveryCompany }</td>
              <td>{item.deliveryCurrentLocation}</td>
          </tr>)}
      </tbody>
      </table>
      <p className='tip'>订单未发货？联系商家:<span className='phone'>13691234567</span></p>
  </div>)
}
export default table