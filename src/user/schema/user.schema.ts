import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
	ADMIN = 'admin',
	USER = 'user',
}

@Schema({
	timestamps: true,
})
export class User {
	@Prop({ required: true, trim: true })
	name: string;

	@Prop({ required: true, unique: true, lowercase: true, trim: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({
		type: String,
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@Prop({ default: true })
	isActive: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
