import { PartialType } from '@nestjs/mapped-types';
import { CreateDropDto } from './create-drop.dto';

export class UpdateDropDto extends PartialType(CreateDropDto) {}
