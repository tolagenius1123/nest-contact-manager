import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryContactDto {
	@IsOptional()
	@IsInt()
	@Transform(({ value }) => Number(value))
	page?: number = 1;

	@IsOptional()
	@IsInt()
	@Transform(({ value }) => Number(value))
	limit?: number = 10;

	@IsOptional()
	@IsString()
	search?: string;
}
