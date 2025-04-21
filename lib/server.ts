import { io } from "socket.io-client";


// export const SERVER_URL = "https://troy-book.tail2138e6.ts.net:8443/";
export const SERVER_URL = "http://3.136.27.0:5000";
// export const SERVER_URL = "http://nearsay.troylu.com:5000";

export const socket = io(SERVER_URL);

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