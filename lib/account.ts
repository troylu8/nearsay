import { emitAsync } from "./server";
import { createHash } from "crypto";

export function signUp(username: string, password: string, avatar: number) {
    return emitAsync<string>("sign-up", {
        username,
        password: createHash("sha256").update(password).digest("hex"),
        avatar
    });
}

export function signIn(username: string, password: string, pos: [number, number]) {
    return emitAsync<string>("sign-in", {
        username,
        password: createHash("sha256").update(password).digest("hex"),
        pos
    });
}

export function signInAsGuest(pos: [number, number], avatar: number) {
    return emitAsync<string>("sign-in-guest", { pos, avatar });
}

/** 
 * if all `jwt, username, avatar` are present in `localStorage`, returns `[jwt, username, avatar]`
 * 
 * otherwise, returns `null`
 */
export function getStoredAccountInfo(): [string, string, number] | null {

    const jwt = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar");

    return jwt && username && avatar ? [jwt, username, Number(avatar)] : null;
}

export function clearStoredAccountInfo() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    sessionStorage.clear();
}