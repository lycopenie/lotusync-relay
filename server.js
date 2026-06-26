const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const SECRET = process.env.RELAY_SECRET;
const clients = new Set();

wss.on('connection', (ws, req) => {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const token = params.get('token');

    if (token !== SECRET) {
        ws.close(4001, 'Unauthorized');
        console.log('Rejected unauthorized client');
        return;
    }

    clients.add(ws);
    console.log(`Client connected. Total: ${clients.size}`);

    ws.on('message', (data) => {
        console.log('Received:', data.toString());
        for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Client disconnected. Total: ${clients.size}`);
    });
});

console.log('Server running on ws://localhost:8080');