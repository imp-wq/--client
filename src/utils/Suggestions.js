import store from '../app/state/store';
import getCookie from './getCookie';
const axios = require('axios').default;

let View = 0;
let Pending = 0;
let Complete = 0;

export let SuggestedLinks = {
    Chinese: [{
            text: "新订单",
            countable: false,
            number: null,
        },
        {
            text: "看订单",
            countable: true,
            number: View,
        },
        {
            text: "待处理订单",
            countable: true,
            number: Pending,
        },
        {
            text: "完成的订单",
            countable: true,
            number: Complete,
        }
    ],
    English: [{
            text: "Create a new order",
            countable: false,
            number: null,
        },
        {
            text: "View orders",
            countable: true,
            number: View,
        },
        {
            text: "Get pending orders",
            countable: true,
            number: Pending,
        },
        {
            text: "completed orders",
            countable: true,
            number: Complete,
        }
    ]
}

const ReloadDetails = () => {
    setInterval(async() => {
        const dataPresent = localStorage.getItem('userData');
        if (dataPresent) {
            const Orders = await fetchOrders();
            let CompleteCount = 0;
            let PendingCount = 0;
            Orders.forEach(item => {
                if (item.status === '待付款' || item.status === '已发货') {
                    PendingCount++;
                } else if (item.status === '已完成' || item.status === '已退货') {
                    CompleteCount++;
                }
            });

            View = Orders.length

            SuggestedLinks = {
                Chinese: [{
                        text: "新订单",
                        countable: false,
                        number: 0,
                    },
                    {
                        text: "看订单",
                        countable: true,
                        number: View,
                    },
                    {
                        text: "待处理订单",
                        countable: true,
                        number: PendingCount,
                    },
                    {
                        text: "完成的订单",
                        countable: true,
                        number: CompleteCount,
                    }
                ],
                English: [{
                        text: "Create a new order",
                        countable: false,
                        number: 0,
                    },
                    {
                        text: "View orders",
                        countable: true,
                        number: View,
                    },
                    {
                        text: "Get pending orders",
                        countable: true,
                        number: PendingCount,
                    },
                    {
                        text: "completed orders",
                        countable: true,
                        number: CompleteCount,
                    }
                ]
            }
        }
    }, 5000)
}


const fetchOrders = async() => {
    const {
        users: {
            userEmail
        }
    } = store.getState();

    let UserOrder;

    await axios.get('http://localhost:5000/order', {
        headers: {
            auth: getCookie('jwt')
        },
        params: {
            email: userEmail
        }
    }).then(result => {
        let {
            data: {
                Orders
            }
        } = result;

        UserOrder = Orders;


    }).catch(err => console.log(err))

    return UserOrder;
}

(function() {
    ReloadDetails();
})();