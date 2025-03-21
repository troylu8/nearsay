import { io } from "socket.io-client";


export const SERVER_URL = "http://127.0.0.1:5000";

export const clientSocket = io(SERVER_URL);

function isOk(status: number) {
    return status >= 200 && status <= 299;
}

export async function socketfetch<ResolveType>(event: string, data: any) {
    return new Promise<ResolveType>(
        (resolve, reject) => clientSocket.emit(
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