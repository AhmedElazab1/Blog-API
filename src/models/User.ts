import mongoose from 'mongoose';
import { IUser, UserRole } from './types/types';

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    socialLinks: {
      website: String,
      facebook: String,
      x: String,
      instagram: String,
      linkedin: String,
      youtube: String,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
