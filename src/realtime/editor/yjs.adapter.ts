/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Observable } from 'rxjs';
import { INestApplicationContext, WebSocketAdapter, WsMessageHandler } from '@nestjs/common';
import WebSocket, { Server, ServerOptions } from 'ws';
import { IncomingMessage } from 'http';

export class YjsAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  bindClientConnect (server: Server, callback: (socket: WebSocket, req: IncomingMessage) => void): void {
    console.debug('YjsAdapter connected')
    server.on('connection', callback);
  }

  bindClientDisconnect (client: WebSocket, callback: (socket: WebSocket, req: IncomingMessage) => void): any {
    client.on('disconnect', callback);
  }

  bindMessageHandlers (client: WebSocket, handlers: WsMessageHandler[], transform: (data: any) => Observable<any>): any {
    client.on('message', (data: Buffer) => {
      console.debug('Received realtime message: ' + String(data))
    })

    /*fromEvent(client, 'message')
      .pipe(
        mergeMap(data => this.bindMessageHandler(data, handlers, process)),
        filter(result => result),
      )
      .subscribe(response => client.send(JSON.stringify(response)));*/
  }

  /*bindMessageHandler(
    buffer,
    handlers: WsMessageHandler[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }*/

  close (server: Server): void {
    server.close();
  }

  create (port: number, options?: ServerOptions): Server {
    console.debug('options: ' + JSON.stringify(options));
    const server = new Server({ port, ...options });
    console.log('Initiated WebSocket server for realtime communication')
    // server.shouldHandle = (req: IncomingMessage): boolean => {
    //   console.debug('Realtime connection attempt')
    //   const url = new URL(req.url ?? '');
    //   const pathMatching = /^\/realtime\/(.+)$/.exec(url.pathname);
    //   if (!pathMatching || pathMatching.length < 2) {
    //     return false;
    //   }
    //   const noteIdFromPath = pathMatching[1];
    //   console.debug('Realtime connection attempt to note: ' + noteIdFromPath);
    //   // TODO Check whether note id from path exists
    //   return true;
    // };
    return server;
  }
}
