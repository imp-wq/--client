import { combineReducers } from 'redux';

import orderReducer from './reducers/orders/orderReducer';
import userReducer from './reducers/user/userReducer';
import languageReducer from './reducers/language/languageReducer';

const appReducer = combineReducers({
    orders: orderReducer,
    users: userReducer,
    language: languageReducer
});

const rootReducer = (state, action) => {
    if(action.type === "RESET_APP"){
        state = undefined
    }

    return appReducer(state, action);
}

export default rootReducer;