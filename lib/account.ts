import path from "path";
import bcrypt from "bcryptjs";
import { SERVER_URL } from "./server";
import { createHash } from "crypto";

/** https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library */
function parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

let jwt: string | null;
export let username: string | null;

type UsernameChangedHandler = (username: string | null) => any
const usernameChangedHandlers: Set<UsernameChangedHandler> = new Set();

export function addUsernameChangedHandler(func: UsernameChangedHandler) {
    usernameChangedHandlers.add(func);
}
export function removeUsernameChangedHandler(func: UsernameChangedHandler) {
    usernameChangedHandlers.delete(func);
}

function setAccount(nextJwt: string | null, nextUsername: string | null) {
    jwt = nextJwt;
    
    if (jwt)    localStorage.setItem("jwt", jwt);
    else        localStorage.removeItem("jwt");
    
    setUsername(nextUsername);
}
function setUsername(nextUsername: string | null) {
    username = nextUsername;
    
    if (username)       localStorage.setItem("username", username);
    else                localStorage.removeItem("username");

    for (const handler of usernameChangedHandlers) handler(username);
}
setAccount(localStorage.getItem("jwt"), localStorage.getItem("username"));


/** returns request status code  */
export function signUp(username: string, password: string) {
    return sendAccountChangeRequest("sign-up", username, password);
}

/** returns request status code  */
export function signIn(username: string, password: string) {
    return sendAccountChangeRequest("sign-in", username, password);
}

export function signOut() { 
    setAccount(null, null); 
    sessionStorage.clear();
}

/** returns request status code  */
async function sendAccountChangeRequest(route: "sign-in" | "sign-up", username: string, password: string) {
    const resp = await fetch(path.join(SERVER_URL, route), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username, 
            userhash: createHash("sha256").update(password).digest("hex")
        }),
    });

    if (resp.ok) setAccount(await resp.text(), username);

    return resp.status;
}