// import {
// 	BadRequestException,
// 	Injectable,
// 	NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Contact } from './schema/contact.schema';
// import { Model } from 'mongoose';
// import { MongoServerError } from 'mongodb';
// import { CreateContactDto } from './dto/create-contact.dto';
// import { QueryContactDto } from './dto/query-contact.dto';
// import { UpdateContactDto } from './dto/update-contact.dto';
//
// @Injectable()
// export class ContactService {
// 	constructor(
// 		@InjectModel(Contact.name)
// 		private readonly contactModel: Model<Contact>,
// 	) {}
//
// 	async addContact(createContactDto: CreateContactDto): Promise<Contact> {
// 		try {
// 			return await this.contactModel.create(createContactDto);
// 		} catch (e: unknown) {
// 			if (e instanceof MongoServerError && e.code === 11000) {
// 				throw new BadRequestException(
// 					'Another contact already uses this name or number',
// 				);
// 			}
// 			throw new BadRequestException('Unable to create contact');
// 		}
// 	}
//
// 	async findAllContacts(queryContactDto: QueryContactDto) {
// 		const { page = 1, limit = 10, search } = queryContactDto;
// 		const filter: Record<string, any> = {};
//
// 		if (search) {
// 			filter.fullName = {
// 				$regex: search,
// 				$options: 'i',
// 			};
// 		}
//
// 		const skip = (page - 1) * limit;
//
// 		const [data, total] = await Promise.all([
// 			this.contactModel.find(filter).skip(skip).lean().exec(),
// 			this.contactModel.countDocuments(),
// 		]);
//
// 		return {
// 			data,
// 			total,
// 			page,
// 			limit,
// 		};
// 	}
//
// 	async findContactById(id: string): Promise<Contact> {
// 		const contact = await this.contactModel.findById(id).lean().exec();
//
// 		if (!contact) {
// 			throw new NotFoundException('Contact with this id does not exist');
// 		}
//
// 		return contact;
// 	}
//
// 	async updateContact(
// 		id: string,
// 		updateContactDto: UpdateContactDto,
// 	): Promise<Contact> {
// 		try {
// 			const contact = await this.contactModel
// 				.findByIdAndUpdate(id, updateContactDto, {
// 					new: true,
// 					runValidators: true,
// 					lean: true,
// 				})
// 				.exec();
//
// 			if (!contact) {
// 				throw new NotFoundException(
// 					'Contact with this id does not exist',
// 				);
// 			}
//
// 			return contact;
// 		} catch (e: unknown) {
// 			if (e instanceof MongoServerError && e.code === 11000) {
// 				throw new BadRequestException(
// 					'Another contact already uses this name or number',
// 				);
// 			}
// 			throw e;
// 		}
// 	}
//
// 	async deleteContact(id: string): Promise<void> {
// 		const contact = await this.contactModel.findByIdAndDelete(id);
// 		if (!contact) {
// 			throw new NotFoundException('Contact with this id does not exist');
// 		}
// 	}
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contact } from './schema/contact.schema';
import { Model, Types } from 'mongoose';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactDto } from './dto/query-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
	constructor(
		@InjectModel(Contact.name)
		private readonly contactModel: Model<Contact>,
	) {}

	async addContact(
		createContactDto: CreateContactDto,
		userId: string,
	): Promise<Contact> {
		return this.contactModel.create({
			...createContactDto,
			userId: new Types.ObjectId(userId),
		});
	}

	async findAllContacts(queryContactDto: QueryContactDto, userId: string) {
		const { page = 1, limit = 10, search } = queryContactDto;
		const filter: Record<string, any> = {
			userId: new Types.ObjectId(userId),
		};

		if (search) {
			filter.fullName = {
				$regex: search,
				$options: 'i',
			};
		}

		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.contactModel
				.find(filter)
				.skip(skip)
				.limit(limit)
				.lean()
				.exec(),
			this.contactModel.countDocuments(filter),
		]);

		return {
			data,
			total,
			page,
			limit,
		};
	}

	async findContactById(id: string, userId: string): Promise<Contact> {
		const contact = await this.contactModel
			.findOne({
				_id: id,
				userId: new Types.ObjectId(userId),
			})
			.lean()
			.exec();

		if (!contact) {
			throw new NotFoundException(
				'Contact not found or you do not have access',
			);
		}

		return contact;
	}

	async updateContact(
		id: string,
		updateContactDto: UpdateContactDto,
		userId: string,
	): Promise<Contact> {
		const contact = await this.contactModel
			.findOneAndUpdate(
				{
					_id: id,
					userId: new Types.ObjectId(userId),
				},
				updateContactDto,
				{
					new: true,
					runValidators: true,
					lean: true,
				},
			)
			.exec();

		if (!contact) {
			throw new NotFoundException(
				'Contact not found or you do not have access',
			);
		}

		return contact;
	}

	async deleteContact(
		id: string,
		userId: string,
		isAdmin: boolean,
	): Promise<void> {
		// Admins can delete any contact, users can only delete their own
		const filter: any = { _id: id };
		if (!isAdmin) {
			filter.userId = new Types.ObjectId(userId);
		}

		const contact = await this.contactModel
			.findOneAndDelete(filter)
			.lean()
			.exec();

		if (!contact) {
			throw new NotFoundException(
				'Contact not found or you do not have access',
			);
		}
	}

	// BONUS: Admin method to get all contacts across all users
	async findAllContactsAdmin(queryContactDto: QueryContactDto) {
		const { page = 1, limit = 10, search } = queryContactDto;
		const filter: Record<string, any> = {};

		if (search) {
			filter.fullName = {
				$regex: search,
				$options: 'i',
			};
		}

		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.contactModel
				.find(filter)
				.populate('userId', 'name email') // Include user info
				.skip(skip)
				.limit(limit)
				.lean()
				.exec(),
			this.contactModel.countDocuments(filter),
		]);

		return {
			data,
			total,
			page,
			limit,
		};
	}
}
