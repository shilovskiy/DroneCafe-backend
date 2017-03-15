/**
 * Created by Олег Шиловский on 12.02.2017.
 */

var db = require('./db');

var Schema = db.mongoose.Schema;

// var OrderSchema = new Schema({
//     title: {type: String}, //,unique:true
//     items: [{
//         type: Schema.ObjectId,
//         ref: 'items'
//     }],
//     state: {type: Schema.ObjectId, ref: 'states'},
//     user:{type: Schema.ObjectId, ref: 'users'}
// });
//
var OrderSchema = new Schema({
        title: {type: String}, //,unique:true
        items: [{
            item: {
                type: Schema.ObjectId,
                ref: 'items'
            },
            amount: Number,
            state: {type: Schema.ObjectId, ref: 'states'}
        }],
        state: {type: Schema.ObjectId, ref: 'states'},
        user: {type: Schema.ObjectId, ref: 'users'}
    },
    {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }

    });

var OrderModel = db.mongoose.model('orders', OrderSchema); //Case sensetive model name!!

OrderSchema.virtual('TotalPrice').get(function () {
    return (this.items.length > 0) ? getOrderTotalPrice(this.items) : 0;
});

function getOrderTotalPrice(items) {
    return items.reduce((a, b) => {
        return b.item.price == undefined ? a : a + b.item.price;
    }, 0);
}
module.exports = OrderModel;