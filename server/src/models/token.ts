import { model, Schema } from 'mongoose';

interface TokenDoc extends Document {
  token: string;
  date: number;
}

const TokenSchema: Schema<TokenDoc> = new Schema({
  token: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    default: Date.now(),
  },
});

const Token = model<TokenDoc>('token', TokenSchema);

export default Token;
