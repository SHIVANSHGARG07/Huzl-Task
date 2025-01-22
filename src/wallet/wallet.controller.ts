import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('add-funds')
  async addFunds(@Req() req: Request, @Body('amount') amount: number) {
    return this.walletService.addFunds(req.user.id, amount);
  }

  @Post('withdraw-funds')
  async withdrawFunds(@Req() req: Request, @Body('amount') amount: number) {
    return this.walletService.withdrawFunds(req.user.id, amount);
  }

  @Get('balance')
  async getWalletBalance(@Req() req: Request) {
    return { walletBalance: await this.walletService.getWalletBalance(req.user.id) };
  }

  
}
