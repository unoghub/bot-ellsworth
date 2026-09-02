import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 5305
});

wss.on("connection", (ws) => {
    console.log("New connection has been made via WebSocket");
    
    ws.on("open", () => {
        console.log("Heyyo! We're listening now!");
    });

    ws.on("message", (data) => {
        console.log("Heyyo! We got some data from client!");
    });

    ws.on("close", (code) => {
        console.log("Cya!");
    });
});