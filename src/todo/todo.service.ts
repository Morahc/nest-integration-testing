import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Todo } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto';
import { UpdateTodoDto } from './dto/update-todo';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: string, dto: CreateTodoDto): Promise<Todo> {
    try {
      return await this.prisma.todo.create({
        data: {
          userId,
          ...dto,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Duplicate todo title');
        }
      }
      throw error;
    }
  }

  async updateTodo(
    id: string,
    userId: string,
    dto: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id,
      },
    });

    if (!todo) throw new NotFoundException('Todo with id not found');

    if (todo.userId !== userId)
      throw new ForbiddenException('Access to resource denied');

    return await this.prisma.todo.update({
      where: {
        id,
        userId,
      },
      data: dto,
    });
  }
}
