import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../config/prisma.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UserModule } from '../user/user.module';
import { StreamingController } from './streaming.controller';
import { SpotifyService } from './spotify.service';
import { AppleMusicService } from './apple-music.service';
import { TidalService } from './tidal.service';

@Module({
  imports: [ConfigModule, PrismaModule, SupabaseModule, UserModule],
  controllers: [StreamingController],
  providers: [SpotifyService, AppleMusicService, TidalService],
  exports: [SpotifyService, AppleMusicService, TidalService],
})
export class StreamingModule {}
