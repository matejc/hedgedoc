import { Module } from '@nestjs/common';
import { RealtimeEditorGateway } from './editor/realtime-editor.gateway';

@Module({
  exports: [RealtimeEditorGateway],
  providers: [RealtimeEditorGateway],
})
export class RealtimeModule {}
