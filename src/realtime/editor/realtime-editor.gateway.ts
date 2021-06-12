/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import BiMap from 'bidirectional-map';
import WebSocket, { Server } from 'ws';
import { IncomingMessage } from 'http';

@WebSocketGateway()
export class RealtimeEditorGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private websocketServer: Server;

  private noteClientMap = new BiMap<WebSocket[]>();
  private logger: Logger = new Logger('RealtimeEditorGateway');

  private addClientToNote = (client: WebSocket, noteId: string) => {

  }

  private removeClientFromNote = (client: WebSocket) => {

  }

  afterInit(server: Server): void {
  }

  handleDisconnect(client: WebSocket): void {
  }

  handleConnection(client: WebSocket, req: IncomingMessage): void {
    const url = req.url ?? '';
    const pathMatching = /^\/realtime\/(.+)$/.exec(url);
    if (!pathMatching || pathMatching.length < 2) {
      this.logger.log('No connection because of invalid path: ' + url);
      client.close();
      return;
    }
    const noteIdFromPath = pathMatching[1];
    this.logger.log('Connection to note: ' + noteIdFromPath);
    // TODO Check whether note id from path exists
  }

  @SubscribeMessage('messageSync')
  handleMessageSync(client: WebSocket, @MessageBody() data: string): void {
    this.logger.log('Received SYNC message');
  }

  @SubscribeMessage('messageAwareness')
  handleMessageAwareness(client: WebSocket, @MessageBody() data: string): void {
    this.logger.log('Received AWARENESS message');
  }

  @SubscribeMessage('messageHedgeDoc')
  handleMessageHedgeDoc(client: WebSocket, @MessageBody() data: string): void {
    this.logger.log('Received HEDGEDOC message');
  }
}
