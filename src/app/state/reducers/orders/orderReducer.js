const initialState = [];

export default (state = initialState, action) => {
  switch(action.type) {
    case "INITIALIZE_ORDER" : {
      // if(action.payload) return action.payload
      if(action.payload)
        return action.payload;
      
      return state;
    }
    case "ADD_ORDER": {
      return [...state, action.payload]
    }
    case "ADD_SCHEMATIC": {
      return(
        state.map(
          i => {
            if(i._id === action.payload.id) {
            i.schematics = action.payload.schematics.concat(i.schematics);
            }
            return i
          }
        )
      )
    }
    case "EDIT_ORDER": {
      return (
        state.map( item => item._id === action.payload.id ? 
          {...item, currentProcess: action.payload.process} 
          : item
          )
      )
    }
    case "DELETE_ORDER": {
      return (
        state.filter(item => item._id !== action.payload)
      )
    }
    default:
      return state
  }
}
