import path from "path";
import { emitAsync, SERVER_URL } from "./server";
import { createHash } from "crypto";


type AccountInfo = {
    jwt: string | null;
    username: string | null;
    avatar: number;
    settings: {
        invisible: boolean;
    }
}
const acc: AccountInfo = {
    jwt: null,
    username: null,
    avatar: 0,
    settings: {
        invisible: false
    }
}

type UsernameChangedHandler = (username: string | null) => any
const usernameChangedHandlers: Set<UsernameChangedHandler> = new Set();

export function addUsernameChangedHandler(func: UsernameChangedHandler) {
    usernameChangedHandlers.add(func);
    func(acc.username);
}
export function removeUsernameChangedHandler(func: UsernameChangedHandler) {
    usernameChangedHandlers.delete(func);
}

function setJWT(jwt: string | null) {
    acc.jwt = jwt;
    
    if (jwt)        localStorage.setItem("jwt", jwt);
    else            localStorage.removeItem("jwt");
}
function setUsername(username: string | null) {
    acc.username = username;
    
    if (username)       localStorage.setItem("username", username);
    else                localStorage.removeItem("username");

    for (const handler of usernameChangedHandlers) handler(username);
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

    if (resp.ok) setJWT(await resp.text());

    return resp.status;
}


export async function signInAsGuest(pos: [number, number]) {
    const jwt = await emitAsync<string | null>("sign-in-guest", {pos, avatar: acc.avatar});
    if (jwt) {
        setJWT(jwt);
    }
}

/** returns request status code  */
export function signUp(username: string, password: string) {
    return sendAccountChangeRequest("sign-up", username, password);
}

/** returns request status code  */
export function signIn(username: string, password: string) {
    return sendAccountChangeRequest("sign-in", username, password);
}

export function signInFromLocalStorage() {
    setJWT(localStorage.getItem("jwt"));
    setUsername(localStorage.getItem("username"));
}

export function signOut() { 
    setJWT(null);
    setUsername(null); 
    sessionStorage.clear();
}

