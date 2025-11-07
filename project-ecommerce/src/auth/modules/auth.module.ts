import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../entity/Customer';
import { Address } from '../../entity/Address';
import { AuthService } from '../modules/auth.services';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Address])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
