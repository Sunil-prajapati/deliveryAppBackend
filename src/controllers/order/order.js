import Customer from "../../models/user.js";
import Branch from "../../models/branch.js";
import Order from "../../models/order.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;
    const customerData = await Customer.findById(userId);
    const branchData = await Branch.find(branch);
    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      totalPrice,
      branch,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address available!",
      },
      pickupLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "No address available!",
      },
    });
    const saveOrder = await newOrder.save();
    return reply.status(201).send(saveOrder);
  } catch (error) {
    return reply.status(500).send({ message: "Error creating order", error });
  }
};
