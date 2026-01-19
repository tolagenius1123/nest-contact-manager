import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ResponseInterface } from '../common/interfaces/response.interface';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(
		@Body() createUserDto: CreateUserDto,
	): Promise<ResponseInterface<any>> {
		const result = await this.authService.register(createUserDto);
		return {
			message: 'User registered successfully',
			data: result,
		};
	}

	@Post('login')
	async login(
		@Body() loginUserDto: LoginUserDto,
	): Promise<ResponseInterface<any>> {
		const result = await this.authService.login(loginUserDto);
		return {
			message: 'Login successful',
			data: result,
		};
	}
}
