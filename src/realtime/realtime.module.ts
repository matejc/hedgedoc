import { Module } from '@nestjs/common';
import { RealtimeEditorGateway } from './editor/realtime-editor.gateway';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    LoggerModule,
    UsersModule,
    PermissionsModule,
    NotesModule,
  ],
  exports: [RealtimeEditorGateway],
  providers: [RealtimeEditorGateway],
})
export class RealtimeModule {}
