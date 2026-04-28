// routes.js
import Auth from "../components/Auth";
import Home from "../components/Home";
import ChatLayout from "../components/ChatComponents/ChatContent";
import { CHAT_ROUTE, HOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE, JOIN_ROOM_ROUTE } from "./consts";

export const routes = [
    { path: LOGIN_ROUTE, component: Auth },
    { path: REGISTER_ROUTE, component: Auth },
    { path: JOIN_ROOM_ROUTE, component: Home },
    { path: HOME_ROUTE, component: ChatLayout },
    { path: `${CHAT_ROUTE}/*`, component: ChatLayout }, 
]