import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import { TodoService } from 'src/todo/todo.service';
import { CreateTodoDto } from 'src/todo/dto';
import { TodoStatus } from '@prisma/client';
import { UpdateTodoDto } from 'src/todo/dto/update-todo';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TodoService Int', () => {
  let prisma: PrismaService;
  let todoservice: TodoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = module.get(PrismaService);
    todoservice = module.get(TodoService);
    await prisma.cleanDatabase();
  });

  describe('createTodo() & updateTodo()', () => {
    let userId: string;
    let todoId: string;

    const dto: CreateTodoDto = {
      title: 'Make Jello',
      description: 'Very sweet',
    };

    const updateDto: UpdateTodoDto = {
      description: 'a little less sweet',
      status: 'IN_PROGRESS',
    };

    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'joe@email.com',
          firstName: 'Joe',
          lastName: 'Doe',
        },
      });

      userId = user.id;
    });

    it('should create todo', async () => {
      const todo = await todoservice.createTodo(userId, dto);
      todoId = todo.id;
      expect(todo.title).toBe(dto.title);
      expect(todo.description).toBe(dto.description);
      expect(todo.status).toBe(TodoStatus.OPEN);
    });

    it('should throw on duplicate title', async () => {
      await todoservice
        .createTodo(userId, dto)
        .then((todo) => expect(todo).toBeUndefined())
        .catch((error) => expect(error.status).toBe(403));
    });

    it('should update todo by id', async () => {
      const todo = await todoservice.updateTodo(todoId, userId, updateDto);
      expect(todo.description).toBe(updateDto.description);
      expect(todo.status).toBe(TodoStatus.IN_PROGRESS);
    });

    it('should throw not found', async () => {
      expect(function error() {
        throw new NotFoundException('Not found');
      }).toThrow(NotFoundException);
    });

    it('should throw not found', async () => {
      try {
        await todoservice.updateTodo('1', userId, updateDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Todo with id not found');
      }
    });

    it('should throw forbidden exeception', async () => {
      await expect(
        todoservice.updateTodo(todoId, 'random', updateDto),
      ).rejects.toThrow('Access to resource denied');
    });
  });
});
