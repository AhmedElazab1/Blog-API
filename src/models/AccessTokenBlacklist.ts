import mongoose from 'mongoose';
import { IAccessTokenBlacklist } from './types/types';

const accessTokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const AccessTokenBlacklist = mongoose.model<IAccessTokenBlacklist>(
  'AccessTokenBlacklist',
  accessTokenBlacklistSchema,
);
export default AccessTokenBlacklist;
