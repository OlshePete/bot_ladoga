import { Context } from "telegraf";

export interface SessionData {
    liked: boolean
}
export interface IBotContext extends Context {
    session:SessionData
}