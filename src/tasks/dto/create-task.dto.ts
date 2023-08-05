import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
