const initialState = {
    userEmail: null,
    name: null
}


export default (state = initialState, action) => {
    switch(action.type) {
        case "SIGN_IN": {

           return {
                ...state, 
                userEmail: action.payload.email,
                name: action.payload.name
           }
        }
        default:
            return state
    }
}