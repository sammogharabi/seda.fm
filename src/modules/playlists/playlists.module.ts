import { Module } from '@nestjs/common';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}