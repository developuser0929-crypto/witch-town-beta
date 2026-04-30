export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.host = null;
    this.clients = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/ws') return new Response('Not found', { status: 404 });
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const role = url.searchParams.get('role');
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    if (role === 'host') this.acceptHost(server);
    else if (role === 'client') this.acceptClient(server);
    else server.close(1008, 'bad role');

    return new Response(null, { status: 101, webSocket: client });
  }

  acceptHost(ws) {
    if (this.host) {
      try { this.host.close(1012, 'host replaced'); } catch (_) {}
    }
    this.host = ws;
    ws.send(JSON.stringify({ type: 'host_ready' }));

    ws.addEventListener('message', event => {
      let msg;
      try { msg = JSON.parse(event.data); } catch (_) { return; }
      if (msg.type === 'to_client') {
        const client = this.clients.get(msg.clientId);
        if (client) client.send(JSON.stringify({ type: 'from_host', payload: msg.payload }));
      } else if (msg.type === 'close_client') {
        const client = this.clients.get(msg.clientId);
        if (client) client.close(1000, 'closed by host');
      }
    });

    ws.addEventListener('close', () => this.closeRoom());
    ws.addEventListener('error', () => this.closeRoom());
  }

  acceptClient(ws) {
    if (!this.host) {
      ws.send(JSON.stringify({ type: 'room_missing' }));
      ws.close(1013, 'room missing');
      return;
    }

    const clientId = crypto.randomUUID();
    this.clients.set(clientId, ws);
    this.host.send(JSON.stringify({ type: 'client_open', clientId }));
    ws.send(JSON.stringify({ type: 'client_ready', clientId }));

    ws.addEventListener('message', event => {
      if (!this.host) {
        ws.send(JSON.stringify({ type: 'room_closed' }));
        ws.close(1013, 'room closed');
        return;
      }
      let payload = event.data;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'to_host') payload = msg.payload;
      } catch (_) {}
      this.host.send(JSON.stringify({ type: 'from_client', clientId, payload }));
    });

    const cleanup = () => {
      this.clients.delete(clientId);
      if (this.host) this.host.send(JSON.stringify({ type: 'client_close', clientId }));
    };
    ws.addEventListener('close', cleanup);
    ws.addEventListener('error', cleanup);
  }

  closeRoom() {
    this.host = null;
    for (const ws of this.clients.values()) {
      try {
        ws.send(JSON.stringify({ type: 'room_closed' }));
        ws.close(1012, 'host closed');
      } catch (_) {}
    }
    this.clients.clear();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const room = (url.searchParams.get('room') || '').toUpperCase();
    if (!room || !/^[A-Z2-9]{4,8}$/.test(room)) {
      return new Response('Bad room', { status: 400 });
    }
    const id = env.ROOMS.idFromName(room);
    return env.ROOMS.get(id).fetch(request);
  }
};
