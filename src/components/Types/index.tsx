export interface Messages {
    senderId: string,
    username: string,
    message: string,
    date: string,
    to: string,
    system: boolean,
    PYmessage:string
}
export interface User {
    id: string,
    username: string,
}
export interface Online {
    id: string,
    date: string,
    status: boolean
}

export interface UserLogin {
    email: string,
    username: string,
    password: string
}

export namespace React {
    interface Div<T> {
        pos? : String;
    }
}

export interface BotResponse {
    type: String,
    list: Array<any>,
    text: String,
    action: String
}

export interface OrderSuggestions {
    text: string,
    countable: boolean,
    number: number | null,
}

export interface Order {
    id: String,
    quantity: Number,
    eta: String,
    action: String,
    schematics: Array<any>,
    text: string,
    thickness: Number,
    surface: string
}

export interface SelectedChatProp {
    user: User
    messages: Messages[]
    to: string
    toUser: User | null
    online: Online
    // sendMessage: (senderId: string, username: string, message: string, to: string) => void
    // removeUnread: (userId: string, to: string) => void
    // filterSelected: (userId: string, to: string) => void
    locale: string,
    // newOrder: () => void,
    BotSuggestions: Object | any,
}