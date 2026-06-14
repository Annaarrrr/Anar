import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateRequestDto {
  @IsString({ message: 'goalText must be a string.' })
  @IsNotEmpty({ message: 'goalText must not be empty.' })
  @MinLength(10, { message: 'goalText must be at least 10 characters — please be more descriptive.' })
  @MaxLength(500, { message: 'goalText must not exceed 500 characters.' })
  goalText!: string; // ← just add !
}