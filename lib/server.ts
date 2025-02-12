import { io } from "socket.io-client";


export const SERVER_URL = "https://troy-book.tail2138e6.ts.net:8443/";

export const clientSocket = io(SERVER_URL);

export async function emitAsync<ResponseType>(event: string, data: Record<string, any>) {
    return new Promise<ResponseType>((resolve, _) => clientSocket.emit(event, data, resolve));
}
