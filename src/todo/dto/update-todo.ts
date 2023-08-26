import { TodoStatus } from '@prisma/client';

export class UpdateTodoDto {
  title?: string;
  description?: string;
  status?: TodoStatus;
}
