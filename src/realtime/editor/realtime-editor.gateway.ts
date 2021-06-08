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

@WebSocketGateway({ path: '/realtime' })
export class RealtimeEditorGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private websocketServer: Server;

  private noteClientMap = new BiMap<WebSocket[]>();
  private logger: Logger = new Logger('RealtimeEditorGateway');

  afterInit(server: Server): void {
    this.logger.log('Init server');
  }

  handleDisconnect(client: WebSocket): void {
    this.logger.log(`Client disconnected`);
  }

  handleConnection(client: WebSocket, req: IncomingMessage): void {
    this.logger.log(`Client connected: ${ req.url ?? '' }`);
  }

  @SubscribeMessage('example2')
  handleExample2Message(client: any, @MessageBody() data: string): void {
    this.websocketServer.emit('msgToClient', data);
  }
}
