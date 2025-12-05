import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { PostsService } from './posts.service';
import { CommentsService } from './comments.service';
import { LikesService } from './likes.service';
import { FollowsService } from './follows.service';
import { PrismaModule } from '../../config/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [FeedController],
  providers: [FeedService, PostsService, CommentsService, LikesService, FollowsService],
  exports: [FeedService, PostsService, CommentsService, LikesService, FollowsService],
})
export class FeedModule {}
