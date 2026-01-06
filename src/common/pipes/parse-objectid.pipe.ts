import { BadRequestException, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export class ParseObjectIdPipe implements PipeTransform {
	transform(value: string): string {
		if (!isValidObjectId(value)) {
			throw new BadRequestException('Invalid MongoDB ObjectId');
		}
		return value;
	}
}
