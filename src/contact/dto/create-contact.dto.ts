import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
	@IsNotEmpty({ message: 'Full name is a required field' })
	@IsString()
	readonly fullName: string;

	@IsNotEmpty({ message: 'Phone number is a required field' })
	@IsString()
	@MinLength(11, { message: 'Phone number cannot be lesser than 11 digits' })
	@MaxLength(11, { message: 'Phone number must be 11 digits' })
	readonly phoneNumber: string;
}
