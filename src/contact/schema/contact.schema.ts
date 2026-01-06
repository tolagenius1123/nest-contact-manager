import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
// ContactSchema.index({ fullName: 1, phoneNumber: 1 }, { unique: true });
