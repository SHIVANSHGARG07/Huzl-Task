import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';  // Adjust the path if needed
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EscrowService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async fundEscrow(userId: string, amount: number) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.walletBalance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    user.walletBalance -= amount;
    user.escrowBalance += amount;
    await user.save();

    return {
      message: 'Funds moved to escrow',
      walletBalance: user.walletBalance,
      escrowBalance: user.escrowBalance,
    };
  }

  async releaseEscrow(senderId: string, recipientId: string, amount: number) {
    const sender = await this.userModel.findById(senderId);
    const recipient = await this.userModel.findById(recipientId);

    if (!sender || !recipient) {
      throw new BadRequestException('User(s) not found');
    }

    if (sender.escrowBalance < amount) {
      const totalAmount = sender.escrowBalance + sender.walletBalance;
      sender.walletBalance = totalAmount;
      sender.escrowBalance = 0;
      await sender.save();

      return {
        message: 'Insufficient escrow funds, all funds moved to wallet',
        sender: {
          walletBalance: sender.walletBalance,
          escrowBalance: sender.escrowBalance,
        },
        transactionStatus: 'Failed',
      };
    }

    sender.escrowBalance -= amount;
    recipient.walletBalance += amount;

    await sender.save();
    await recipient.save();

    return {
      message: 'Funds released to recipient',
      sender: { escrowBalance: sender.escrowBalance },
      recipient: { totalWalletBalance: recipient.walletBalance },
      transactionStatus: 'Success',
    };
  }

  async refundEscrow(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const totalRefundAmount = user.escrowBalance;
    user.walletBalance += totalRefundAmount;
    user.escrowBalance = 0;
    await user.save();

    return {
      message: 'Funds refunded to wallet',
      walletBalance: user.walletBalance,
      escrowBalance: user.escrowBalance,
    };
  }
}
