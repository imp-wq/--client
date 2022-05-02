const initialState = 'Chinese';

export default (state = initialState, action) => 
    action.type === "CHANGE_LANGUAGE" ? 
    action.payload : state;