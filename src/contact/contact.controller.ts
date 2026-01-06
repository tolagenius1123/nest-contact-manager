import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ResponseInterface } from '../common/interfaces/response.interface';
import { Contact } from './schema/contact.schema';
import { ContactService } from './contact.service';
import { QueryContactDto } from './dto/query-contact.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contact')
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@Post()
	async addContact(
		@Body()
		createContactDto: CreateContactDto,
	): Promise<ResponseInterface<Contact>> {
		const newContact =
			await this.contactService.addContact(createContactDto);
		return {
			message: 'Contact created successfully',
			data: newContact,
		};
	}

	@Get()
	async findAllContacts(@Query() queryContactDto: QueryContactDto) {
		return await this.contactService.findAllContacts(queryContactDto);
	}

	@Get(':id')
	async findContactById(
		@Param('id', ParseObjectIdPipe) id: string,
	): Promise<ResponseInterface<Contact>> {
		const contact = await this.contactService.findContactById(id);
		return {
			message: 'Contact retrieved successfully',
			data: contact,
		};
	}

	@Put(':id')
	async updateContact(
		@Param('id', ParseObjectIdPipe) id: string,
		@Body() updateContactDto: UpdateContactDto,
	): Promise<ResponseInterface<Contact>> {
		const contact = await this.contactService.updateContact(
			id,
			updateContactDto,
		);
		return {
			message: 'Contact updated successfully',
			data: contact,
		};
	}

	@Delete(':id')
	async deleteContact(
		@Param('id', ParseObjectIdPipe) id: string,
	): Promise<ResponseInterface<void>> {
		await this.contactService.deleteContact(id);
		return {
			message: 'Contact deleted successfully',
		};
	}
}
