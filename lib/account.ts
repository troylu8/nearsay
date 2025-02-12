import path from "path";
import { SERVER_URL } from "./server";
import { createHash } from "crypto";


let jwt: string | null;
export let username: string | null;

type UsernameChangedHandler = (username: string | null) => any
const usernameChangedHandlers: Set<UsernameChangedHandler> = new Set();

export function addUsernameChangedHandler(func: UsernameChangedHandler) {
    usernameChangedHandlers.add(func);
    func(username);
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



/** returns request status code  */
export function signUp(username: string, password: string) {
    return sendAccountChangeRequest("sign-up", username, password);
}

/** returns request status code  */
export function signIn(username: string, password: string) {
    return sendAccountChangeRequest("sign-in", username, password);
}

export function signInFromLocalStorage() {
    setAccount(localStorage.getItem("jwt"), localStorage.getItem("username"));
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