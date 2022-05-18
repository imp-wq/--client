import io from 'socket.io-client';
import socketLink from '../socketContext';
import store from '../app/state/store';

const axios = require('axios').default;
let socket = io(socketLink);

// eslint-disable-next-line no-extend-native
Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};


const GetStatus = (userData, Orders) => {

    if (store && Orders) {
        Orders.forEach(i => {
            const { estimatedTime, currentProcess } = i;

            //today's date
            let dateToday = new Date();
            let DateTodayString = (dateToday.getMonth() + 1) + '/' + dateToday.getDate() + '/' + dateToday.getFullYear();

            //order of the date
            let OrderCompletionDate = estimatedTime.split('/');
            OrderCompletionDate.move(1, 0);
            const OrderString = OrderCompletionDate[0] + '/' + OrderCompletionDate[1] + '/' + OrderCompletionDate[2]

            //assign format
            const orderDate = new Date(OrderString);
            const DateNow = new Date(DateTodayString);

            const diffTime = Math.abs(DateNow - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            //This process would honestly be done manually but for the sake of demonstration
            //the automatic message it's changed via function
            let cProcess;

            if (diffDays >= 12) {
                cProcess = 'Processing...';
            } else if (diffDays < 12 && diffDays >= 10) {
                cProcess = 'Process D';
            } else if (diffDays < 10 && diffDays >= 8) {
                cProcess = 'Process B';
            } else if (diffDays < 8 && diffDays >= 5) {
                cProcess = 'Process C';
            } else if (diffDays < 5 && diffDays >= 1) {
                cProcess = 'Process D'
            } else if (diffDays < 1) {
                cProcess = 'Ready for collection'
            }

            if (currentProcess !== cProcess) {
                UpdateUser({ i, cProcess, userData });
            }
        })
    }
}

const UpdateUser = async({ i, cProcess, userData }) => {

    const { users, language } = store.getState();

    await axios.put('/getOrder', {
        params: {
            user: users.userEmail,
            orderId: i._id,
            Process: cProcess,
            language
        }
    }).then(result => {
        const { message, orderId, Process } = result.data;

        store.dispatch({
            type: 'EDIT_ORDER',
            payload: {
                id: orderId,
                process: Process
            }
        })

        socket.emit('message-client', {
            senderId: 'Customer-Service-auto',
            username: userData.username,
            message,
            to: userData.id,
            date: new Date(),
            language: language
        })
    }).catch(err => {
        console.log(err);
    })
}

export default GetStatus;