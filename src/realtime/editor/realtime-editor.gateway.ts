/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { NotesService } from '../../notes/notes.service';
import { PermissionsService } from '../../permissions/permissions.service';
import { UsersService } from '../../users/users.service';
import { Note } from '../../notes/note.entity';
import { NoteClientMap } from './note-client-map';
import { MessageHandlerCallbackResponse } from './yjs.adapter';

/**
 * Gateway implementing the realtime logic required for realtime note editing.
 */
@WebSocketGateway()
export class RealtimeEditorGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private permissionsService: PermissionsService,
    private userService: UsersService,
  ) {
    this.logger.setContext(RealtimeEditorGateway.name)
  }

  /** Mapping instance keeping track of WebSocket clients and their associated note identifier. */
  private noteClientMap = new NoteClientMap();

  /**
   * Handler that is called when a WebSocket client disconnects.
   * Removes the client from the note-client mapping instance, if it is present there.
   * @param client The WebSocket client that disconnects.
   */
  handleDisconnect(client: WebSocket): void {
    const noteIdOfClient = this.noteClientMap.getNoteIdByClient(client);
    if (noteIdOfClient === undefined) {
      return;
    }
    this.logger.log(`Client disconnected from note '${noteIdOfClient}'`);
    this.noteClientMap.removeClient(client);
    // TODO If this client was the last one participating on a note, close the YDoc of the note and store it to the db.
  }

  /**
   * Handler that is called for each new WebSocket client connection.
   * Checks whether the requested URL path is valid, whether the requested note
   * exists and whether the requesting user has access to the note.
   * Closes the connection to the client if one of the conditions does not apply.
   *
   * @param client The WebSocket client object.
   * @param req The underlying HTTP request of the WebSocket connection.
   */
  async handleConnection(client: WebSocket, req: IncomingMessage): Promise<void> {
    const url = req.url ?? '';
    const pathMatching = /^\/realtime\/(.+)$/.exec(url);
    if (!pathMatching || pathMatching.length < 2) {
      this.logger.log('Realtime connection denied (invalid URL path): ' + url);
      client.close();
      return;
    }
    const noteIdFromPath = pathMatching[1];
    // TODO Use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    let note: Note;
    try {
      note = await this.noteService.getNoteByIdOrAlias(noteIdFromPath);
    } catch (e) {
      // TODO Send error message to client to avoid reconnects for same note
      client.close();
      this.logger.error(`Encountered an error: ${String(e)}`);
      return;
    }
    if (!this.permissionsService.mayRead(user, note)) {
      // TODO Send error message to client to avoid reconnects for same note
      client.close();
      this.logger.log(`Reading note '${noteIdFromPath}' by user '${user.userName}' denied!`);
      return;
    }
    this.noteClientMap.addClient(client, note.id);
    this.logger.log(`Connection to note '${note.id}' by user '${user.userName}'`);
  }

  /**
   * Handler that is called when a SYNC message is received from a WebSocket client.
   * SYNC messages are part of the Y-js protocol, containing changes on the note.
   * @param client The WebSocket client that sent the message.
   * @param data The binary message received from the client.
   * @returns void If no response should be send for this request back to the client.
   * @returns Uint8Array Binary data that should be send as a response to the message back to the client.
   */
  @SubscribeMessage('messageSync')
  handleMessageSync(client: WebSocket, @MessageBody() data: Uint8Array): MessageHandlerCallbackResponse {
    this.logger.log('Received SYNC message');
    return Promise.resolve()
  }

  /**
   * Handler that is called when a AWARENESS message is received from a WebSocket client.
   * AWARENESS messages are part of the Y-js protocol, containing e.g. the cursor states.
   * @param client The WebSocket client that sent the message.
   * @param data The binary message received from the client.
   * @returns void If no response should be send for this request back to the client.
   * @returns Uint8Array Binary data that should be send as a response to the message back to the client.
   */
  @SubscribeMessage('messageAwareness')
  handleMessageAwareness(client: WebSocket, @MessageBody() data: Uint8Array): MessageHandlerCallbackResponse {
    this.logger.log('Received AWARENESS message');
    return Promise.resolve()
  }

  /**
   * Handler that is called when a HEDGEDOC message is received from a WebSocket client.
   * HEDGEDOC messages are custom messages containing other real-time important information like permission changes.
   * @param client The WebSocket client that sent the message.
   * @param data The binary message received from the client.
   * @returns void If no response should be send for this request back to the client.
   * @returns Uint8Array Binary data that should be send as a response to the message back to the client.
   */
  @SubscribeMessage('messageHedgeDoc')
  handleMessageHedgeDoc(client: WebSocket, @MessageBody() data: Uint8Array): MessageHandlerCallbackResponse {
    this.logger.log('Received HEDGEDOC message');
    return Promise.resolve()
  }
}
