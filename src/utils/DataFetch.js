import store from '../app/state/store';
import GetStatus from './GetStatus';
import getCookie from './getCookie';
import ForceUserOut from './ForceUserOut';
const axios = require('axios').default;

let userData, userEmail;

try { 
    // set the user that's online
    userData = JSON.parse(localStorage.getItem('userData'));
    userEmail = userData.id;
} catch (err) {
    ForceUserOut();
}

const FetchData = async () => {
    // set Orders
    userData = JSON.parse(localStorage.getItem('userData'));
    userEmail = userData.id
    const Orders = await fetchOrders(userEmail);

    //Initialize Order
    store.dispatch({ type: "INITIALIZE_ORDER", payload: Orders });

    //Get Initial status of orders
    GetStatus(userData, Orders);

    //Periodically get Status
    ReloadDetails();
}

// Check for updates every minute
export const ReloadDetails = () => {
    setInterval( async () => {
        const dataPresent = await JSON.parse(localStorage.getItem('userData'));
        if(dataPresent){
            const Orders = await fetchOrders(dataPresent.id);
            GetStatus(userData, Orders) 
        } else {
            alert('There was an error verifying your account. Please login to verify your account');
            ForceUserOut();
        }
    }, 10000)
}

const fetchOrders = async email => {
    let userOrders;
    await axios.get('http://localhost:5000/order', {
        headers:{
            auth: getCookie('jwt')
        },
        params: {
            email
        }
    }).then ( result => {
        userOrders = result.data.Orders;
    }).catch( err => {
        alert('There was an error verifying your account. HAHAHAHA Please login to verify your account');
        ForceUserOut();
    })

    return userOrders;
}

export default FetchData;