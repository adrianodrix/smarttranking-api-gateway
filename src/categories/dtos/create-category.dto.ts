import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IEvent } from '../interfaces/category.interface';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  readonly category: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  events: IEvent[];
}
