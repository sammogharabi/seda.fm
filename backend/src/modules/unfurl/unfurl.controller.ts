import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UnfurlService, LinkMetadata } from './unfurl.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IsUrl, IsNotEmpty } from 'class-validator';

export class UnfurlLinkDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}

@Controller('unfurl')
@UseGuards(AuthGuard)
export class UnfurlController {
  constructor(private readonly unfurlService: UnfurlService) {}

  @Post()
  async unfurlLink(@Body() dto: UnfurlLinkDto): Promise<LinkMetadata | null> {
    return this.unfurlService.unfurlLink(dto.url);
  }
}
