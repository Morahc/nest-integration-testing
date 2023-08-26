import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async login(dto: LoginDto) {
    return 'login';
  }

  async register(dto: RegisterDto) {
    return 'register';
  }
}
