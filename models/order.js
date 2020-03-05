const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Defining an Order schema for the mongoDB

const orderSchema = new Schema({
  products: [
    {
      product: {
        type: Object,
        required: true
      },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  }
});

module.exports = mongoose.model("Order", orderSchema);
