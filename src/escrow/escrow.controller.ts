import { Controller, Post, Body, Param, Req, BadRequestException } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { Request } from 'express';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('fund-escrow')
  async fundEscrow(@Req() req: Request, @Body('amount') amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }
    return this.escrowService.fundEscrow(req.user, amount);
  }

  @Post('release-escrow/:id')
  async releaseEscrow(
    @Req() req: Request,
    @Param('id') recipientId: string,
    @Body('amount') amount: number
  ) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    return this.escrowService.releaseEscrow(req.user, recipientId, amount);
  }

  @Post('refund-escrow')
  async refundEscrow(@Req() req: Request) {
    return this.escrowService.refundEscrow(req.user);
  }
}
