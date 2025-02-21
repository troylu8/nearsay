import { io } from "socket.io-client";


export const SERVER_URL = "https://troy-book.tail2138e6.ts.net:8443/";

export const clientSocket = io(SERVER_URL);

export async function emitAsync<ResolveType>(event: string, data: Record<string, any>) {
    return new Promise<ResolveType>(
        (resolve, reject) => clientSocket.emit(
            event, 
            data, 
            (result: any) => {
                if (result instanceof Number)   reject(result);
                else                            resolve(result);
            }
        )
    );
}
