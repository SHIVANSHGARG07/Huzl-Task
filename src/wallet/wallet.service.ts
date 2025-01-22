import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class WalletService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async addFunds(userId: string, amount: number): Promise<User> {
    if (amount <= 0) throw new BadRequestException('Invalid amount');

    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    user.walletBalance += amount;
    return user.save();
  }

  async withdrawFunds(userId: string, amount: number): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    if (user.walletBalance < amount) throw new BadRequestException('Insufficient funds');

    user.walletBalance -= amount;
    return user.save();
  }

  async getWalletBalance(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    return user.walletBalance;
  }
}
