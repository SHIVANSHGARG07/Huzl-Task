// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from '../schemas/user.schema';
// import * as bcrypt from 'bcryptjs';
// import * as jwt from 'jsonwebtoken';

// @Injectable()
// export class AuthService {
//   constructor(@InjectModel(User.name) private userModel: Model<User>) {}

//   async signup(email: string, password: string): Promise<User> {
//     const existingUser = await this.userModel.findOne({ email });
//     if (existingUser) throw new UnauthorizedException('User already exists');

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new this.userModel({ email, password: hashedPassword });
//     return newUser.save();
//   }

//   async login(email: string, password: string): Promise<string> {
//     const user = await this.userModel.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const jwtSecret = process.env.JWT_SECRET;
//     if (!jwtSecret) {
//       throw new Error('JWT_SECRET is not defined');
//     }

//     return jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
//   }

// }

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async signup(
    email: string,
    password: string,
    walletBalance: number,
    escrowBalance: number,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      walletBalance,
      escrowBalance,
    });

    return await newUser.save();
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { id: user._id, data: 'bWFkZSB3aXRoIGxvdmUgYnkgc2hpdmFtYmFqcGFpMDQ=' },
      jwtSecret,
      { expiresIn: '1d' },
    );

    return { token, user };
  }
}
