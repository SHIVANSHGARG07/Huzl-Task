import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('walletBalance') walletBalance: number,
    @Body('escrowBalance') escrowBalance: number,
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.signup(email, password, walletBalance, escrowBalance);
      return res.status(HttpStatus.CREATED).json({
        message: 'User successfully registered',
        _id: user._id,
        email: user.email,
        walletBalance: user.walletBalance,
        escrowBalance: user.escrowBalance,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    try {
      const { token, user } = await this.authService.login(email, password);
      res.cookie('jwt', token);
      return res.status(HttpStatus.OK).json({
        message: 'Login successful',
        _id: user._id,
        email: user.email,
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: error.message });
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      res.cookie('jwt', '', { maxAge: 0 });
      return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
