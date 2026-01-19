// import {
// 	Body,
// 	Controller,
// 	Delete,
// 	Get,
// 	Param,
// 	Post,
// 	Put,
// 	Query,
// 	UseGuards,
// } from '@nestjs/common';
// import { CreateContactDto } from './dto/create-contact.dto';
// import { ResponseInterface } from '../common/interfaces/response.interface';
// import { Contact } from './schema/contact.schema';
// import { ContactService } from './contact.service';
// import { QueryContactDto } from './dto/query-contact.dto';
// import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
// import { UpdateContactDto } from './dto/update-contact.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { UserRole } from '../user/schema/user.schema';
//
// @Controller('contact')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class ContactController {
// 	constructor(private readonly contactService: ContactService) {}
//
// 	@Post()
// 	async addContact(
// 		@Body()
// 		createContactDto: CreateContactDto,
// 		@CurrentUser() user: any,
// 	): Promise<ResponseInterface<Contact>> {
// 		const newContact =
// 			await this.contactService.addContact(createContactDto);
// 		return {
// 			message: 'Contact created successfully',
// 			data: newContact,
// 		};
// 	}
//
// 	@Get()
// 	async findAllContacts(
// 		@Query() queryContactDto: QueryContactDto,
// 		@CurrentUser() user: any,
// 	) {
// 		return await this.contactService.findAllContacts(queryContactDto);
// 	}
//
// 	@Get(':id')
// 	async findContactById(
// 		@Param('id', ParseObjectIdPipe) id: string,
// 	): Promise<ResponseInterface<Contact>> {
// 		const contact = await this.contactService.findContactById(id);
// 		return {
// 			message: 'Contact retrieved successfully',
// 			data: contact,
// 		};
// 	}
//
// 	@Put(':id')
// 	async updateContact(
// 		@Param('id', ParseObjectIdPipe) id: string,
// 		@Body() updateContactDto: UpdateContactDto,
// 	): Promise<ResponseInterface<Contact>> {
// 		const contact = await this.contactService.updateContact(
// 			id,
// 			updateContactDto,
// 		);
// 		return {
// 			message: 'Contact updated successfully',
// 			data: contact,
// 		};
// 	}
//
// 	@Delete(':id')
// 	@Roles(UserRole.ADMIN)
// 	async deleteContact(
// 		@Param('id', ParseObjectIdPipe) id: string,
// 	): Promise<ResponseInterface<void>> {
// 		await this.contactService.deleteContact(id);
// 		return {
// 			message: 'Contact deleted successfully',
// 		};
// 	}
// }

import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ResponseInterface } from '../common/interfaces/response.interface';
import { Contact } from './schema/contact.schema';
import { ContactService } from './contact.service';
import { QueryContactDto } from './dto/query-contact.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schema/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthUser {
	userId: string;
	email: string;
	role: UserRole;
}

@Controller('contact')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@Post()
	async addContact(
		@Body() createContactDto: CreateContactDto,
		@CurrentUser() user: AuthUser,
	): Promise<ResponseInterface<Contact>> {
		const newContact = await this.contactService.addContact(
			createContactDto,
			user.userId,
		);
		return {
			message: 'Contact created successfully',
			data: newContact,
		};
	}

	@Get()
	async findAllContacts(
		@Query() queryContactDto: QueryContactDto,
		@CurrentUser() user: AuthUser,
	) {
		// Regular users see only their contacts
		return this.contactService.findAllContacts(
			queryContactDto,
			user.userId,
		);
	}

	@Get('admin/all')
	@Roles(UserRole.ADMIN)
	async findAllContactsAdmin(@Query() queryContactDto: QueryContactDto) {
		// Admins can see all contacts from all users
		return this.contactService.findAllContactsAdmin(queryContactDto);
	}

	@Get(':id')
	async findContactById(
		@Param('id', ParseObjectIdPipe) id: string,
		@CurrentUser() user: AuthUser,
	): Promise<ResponseInterface<Contact>> {
		const contact = await this.contactService.findContactById(
			id,
			user.userId,
		);
		return {
			message: 'Contact retrieved successfully',
			data: contact,
		};
	}

	@Patch(':id')
	async updateContact(
		@Param('id', ParseObjectIdPipe) id: string,
		@Body() updateContactDto: UpdateContactDto,
		@CurrentUser() user: AuthUser,
	): Promise<ResponseInterface<Contact>> {
		const contact = await this.contactService.updateContact(
			id,
			updateContactDto,
			user.userId,
		);
		return {
			message: 'Contact updated successfully',
			data: contact,
		};
	}

	@Delete(':id')
	async deleteContact(
		@Param('id', ParseObjectIdPipe) id: string,
		@CurrentUser() user: AuthUser,
	): Promise<ResponseInterface<void>> {
		const isAdmin = user.role === UserRole.ADMIN;
		await this.contactService.deleteContact(id, user.userId, isAdmin);
		return {
			message: 'Contact deleted successfully',
		};
	}
}
