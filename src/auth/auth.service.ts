import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../user/dto/login-user.dto';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>,
		private readonly jwtService: JwtService,
	) {}

	async register(createUserDto: CreateUserDto) {
		const { email, password, name } = createUserDto;

		// check if user already exist
		const existingUser = await this.userModel.findOne({ email });
		if (existingUser) {
			throw new ConflictException('User with this email already exists');
		}

		// hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await this.userModel.create({
			name,
			email,
			password: hashedPassword,
		});

		// generate token
		const token = this.generateToken(user);

		return {
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		};
	}

	async login(loginUserDto: LoginUserDto) {
		const { email, password } = loginUserDto;

		// find user
		const user = await this.userModel
			.findOne({ email })
			.select('+password');

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		// check if user is active
		if (!user.isActive) {
			throw new UnauthorizedException('Account is deactivated');
		}

		// compare password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		// generate token
		const token = this.generateToken(user);

		return {
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		};
	}

	async validateUser(userId: string) {
		const user = await this.userModel.findById(userId);
		if (!user || !user.isActive) {
			throw new UnauthorizedException('User not found or inactive');
		}
		return user;
	}

	private generateToken(user: UserDocument) {
		const payload = {
			sub: user._id.toString(),
			email: user.email,
			role: user.role,
		};
		return this.jwtService.sign(payload);
	}
}
