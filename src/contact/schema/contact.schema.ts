import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
	timestamps: true,
})
export class Contact {
	@Prop({
		required: true,
		unique: true,
	})
	fullName: string;

	@Prop({
		required: true,
		unique: true,
	})
	phoneNumber: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
	userId: Types.ObjectId;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
// ContactSchema.index({ fullName: 1, phoneNumber: 1 }, { unique: true });
