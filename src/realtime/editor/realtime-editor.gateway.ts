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
import ws from 'ws';

@WebSocketGateway({ path: '/realtime' })
export class RealtimeEditorGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private websocketServer: ws.Server;

  private noteClientMap = new BiMap<any[]>(); // FIXME replace any with type of ws-client
  private logger: Logger = new Logger('RealtimeEditorGateway');

  afterInit(server: ws.Server) {
    this.logger.log('Init server');
  }

  handleDisconnect(client: any) {
    // FIXME any

    this.logger.log(`Client disconnected: ${JSON.stringify(client)}`);
  }

  handleConnection(client: any, ...args: any[]) {
    // FIXME any

    // TODO Check that user is authenticated, otherwise disconnect
    // TODO Setup keep-alive check
    this.logger.log(`Client connected`);
  }

  @SubscribeMessage('connect')
  handleExampleMessage(client: any, @MessageBody() data: string): void {
    // TODO Check if data is valid  note-id
    // TODO Retrieve relevant YDoc
  }

  @SubscribeMessage('example2')
  handleExample2Message(client: any, @MessageBody() data: string): void {
    this.websocketServer.emit('msgToClient', data);
  }
}
