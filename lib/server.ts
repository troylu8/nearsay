import { io } from "socket.io-client";


// export const SERVER_URL = "http://localhost:21114";
export const SERVER_URL = "https://api-nearsay.troylu.com";

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