import { createStore, compose } from '@reduxjs/toolkit'
import rootReducer from './reducer'

const store = createStore(
    rootReducer, 
    {
        orders:null, 
        users:null, 
        language:"Chinese"
    }, 
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);

export default store;