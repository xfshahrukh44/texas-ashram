import {Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Inject, Request} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../auth/auth.guard";
import {MessagesService} from "../messages/messages.service";
import {AddUserDto} from "./dto/add-user.dto";
import {UsersService} from "../users/users.service";
import {IsNull, Repository} from "typeorm";
import {Group} from "./entities/group.entity";

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(
      private readonly groupsService: GroupsService,
      private readonly messageService: MessagesService,
      private readonly usersService: UsersService,
      @Inject('GROUP_REPOSITORY')
      private groupRepository: Repository<Group>,
  ) {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
      createGroupDto.created_at = Date.now().toString();
      let res = await this.groupsService.create(createGroupDto);

      return {
          success: !res.error,
          message: res.error ? res.error : 'Group created successfully!',
          data: res.error ? [] : res,
      }
  }

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
      let res = await this.groupsService.findAll(page, limit);

      return {
          success: true,
          message: '',
          ...res
      }
  }

  @Get('get-messages/:group_id')
  async getMessages(@Request() req, @Param('group_id') group_id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
      let group = await this.groupsService.findOne(+group_id);

      if (group.error) {
          return {
              success: false,
              message: 'Group not found',
              data: []
          }
      }

      let user = await this.usersService.findOneByEmail(req.user.email);
      let blocked_users = (user.blocked_users == null) ? [] : JSON.parse(user.blocked_users);

      let res = await this.messageService.findAll(page, limit, {
          where: {
              group_id: group_id,
              blocked_at: IsNull()
          }}, true, group_id);

      //filter messages of blocked users
      res.data = await Promise.all(
          res.data.map(async (message) => {
              if (!blocked_users.includes(message.user_id)) {
                  return {
                      ...message
                  }
              }
          })
      );

      // Remove null entries from the array
      res.data = res.data.filter((entry) => entry !== null && entry !== undefined);

      return {
          success: true,
          message: '',
          ...res
      }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
      let res = await this.groupsService.findOne(+id);

      return {
          success: !res.error,
          message: res.error ? res.error : '',
          data: res.error ? [] : res,
      }
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
      let group = await this.groupsService.findOne(+id);
      if (group.error) {
          return {
              success: false,
              message: group.error,
              data: [],
          }
      }

      let res = await this.groupsService.update(+id, updateGroupDto);

      return {
          success: !res.error,
          message: res.error ? res.error : 'Group updated successfully!',
          data: res.error ? [] : res,
      }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
      let group = await this.groupsService.findOne(+id);
      if (group.error) {
          return {
              success: false,
              message: group.error,
              data: [],
          }
      }

      let res = await this.groupsService.remove(+id);

      return {
          success: !res.error,
          message: res.error ? res.error : 'Group deleted successfully!',
          data: res.error ? [] : res,
      }
  }

  @Post('user/add')
  async addUser(@Body() addUserDto: AddUserDto) {
      let group = await this.groupsService.findOne(+addUserDto.group_id);
      if (group.error) {
          return {
              success: false,
              message: group.error,
              data: [],
          }
      }

      let user = await this.usersService.findOne(+addUserDto.user_id);
      if (user.error) {
          return {
              success: false,
              message: user.error,
              data: [],
          }
      }

      // Check if the user is already a member of the group
      if (group.members == null) {
          group.members = JSON.stringify([user.id]);
      } else {
          let members = JSON.parse(group.members);

          const isMember = members.some((member) => member === user.id);
          if (isMember) {
              return {
                  success: false,
                  message: 'User is already a member of the group.',
                  data: [],
              };
          }

          members.push(user.id);
          group.members = JSON.stringify(members);
      }

      // Save the updated group
      await this.groupRepository.save(group);

      return {
          success: true,
          message: 'User added to the group successfully.',
          data: [],
      };
  }
}
