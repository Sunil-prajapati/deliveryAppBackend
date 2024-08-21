import mongoose from "mongoose";

//branchSchema Schema (Branch is basically a store)
const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  liveLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  address: { type: String },
  deliveryPartners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;
