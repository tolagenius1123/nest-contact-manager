import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey:
				process.env.JWT_SECRET ||
				'your-secret-key-change-in-production',
		});
	}

	async validate(payload: any) {
		const user = await this.authService.validateUser(payload.sub);
		if (!user) {
			throw new UnauthorizedException();
		}
		return {
			userId: payload.sub,
			email: payload.email,
			role: payload.role,
		};
	}
}
