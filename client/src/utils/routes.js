import Auth from "../components/Auth";
import Chat from "../components/Chat";
import Home from "../components/Home";
import { CHAT_ROUTE, HOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE } from "./consts";

export const routes = [
    {path: LOGIN_ROUTE, component: Auth},
    {path: REGISTER_ROUTE, component: Auth},
    {path: HOME_ROUTE, component: Home},
    {path: CHAT_ROUTE, component: Chat},
    {path: CHAT_ROUTE + '/:id', component: Chat},
]