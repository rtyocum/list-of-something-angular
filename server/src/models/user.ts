import { model, Schema } from 'mongoose';

interface UserDoc extends Document {
  name: string;
  email: string;
  password: string;
  permissionLevel: number;
  date: number;
}

const UserSchema: Schema<UserDoc> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  permissionLevel: {
    type: Number,
    default: 0,
  },

  date: {
    type: Number,
    default: Date.now(),
  },
});

const User = model<UserDoc>('user', UserSchema);

export default User;
