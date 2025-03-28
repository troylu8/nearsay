import { io } from "socket.io-client";


export const SERVER_URL = "https://troy-book.tail2138e6.ts.net:8443";

export const socket = io(SERVER_URL);

socket.on("new-post", p => {
    console.log("got new post: ", p);
});

function isOk(status: number) {
    return status >= 200 && status <= 299;
}

export async function socketfetch<ResolveType>(event: string, data: any) {
    return new Promise<ResolveType>(
        (resolve, reject) => socket.emit(
            event, 
            data, 
            (result: any) => {
                if (typeof result === "number" && !isOk(result))     
                    reject({ msg: `${result} error after emitting '${event}'`, code: result });
                else
                    resolve(result);
            }
        )
    );
}