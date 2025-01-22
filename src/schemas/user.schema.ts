import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop({ default: 0 })
  escrowBalance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);