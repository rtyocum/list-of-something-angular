import { model, Schema } from 'mongoose';

interface ListDoc extends Document {
    item: string;
    createdBy: string;
    date: number;
}

const ListSchema: Schema<ListDoc> = new Schema({
    item: {
        type: String,
        required: true,
    },

    createdBy: {
        type: String,
        required: true,
    },

    date: {
        type: Number,
        default: Date.now(),
    },
});

const List = model<ListDoc>('list', ListSchema);

export default List;
