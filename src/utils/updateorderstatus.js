import axios from 'axios'

const updateOrderStatus = (id, updateObj) => {
    const date = new Date()
    return axios.post('/updateorderstatus', { _id: id, update: { updatedTime: date, ...updateObj } })
}

export default updateOrderStatus