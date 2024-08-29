import { Customer, DeliveryPartner } from "../../models/user.js";
import Branch from "../../models/branch.js";
import Order from "../../models/order.js";
export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;
    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);
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

export const confirmOrder = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery person not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }
    if (order.status !== "available") {
      return reply.status(404).send({ message: "Order not available" });
    }
    order.status = "confirmed";
    order.deliveryPerson = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation.latitude,
      longitude: deliveryPersonLocation.longitude,
      address: deliveryPersonLocation.address || "No address available!",
    };
    req.server.io.to(orderId).emit("Order confirmed", order);
    await order.save();
    return reply.status(200).send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Error confirming order", error });
  }
};

export const updateOrderStatus = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery person not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }
    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(404).send({ message: "Order can not be updated" });
    }
    if (order.deliveryPartner.toString() !== userId) {
      return reply
        .status(403)
        .send({ message: "You are not authorized to update this order" });
    }
    order.status = status;
    order.deliveryPerson = userId;
    order.deliveryPersonLocation = deliveryPersonLocation;
    await order.save();
    req.server.io.to(orderId).emit("Live tracking updates", order);
    return reply.status(200).send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Error Update order", error });
  }
};

export const getOrders = async (req, reply) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.params;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }
    if (customerId) {
      query.customer = customerId;
    }

    const orders = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );
    return reply.status(200).send(orders);
  } catch (error) {
    return reply.status(500).send({ message: "Error getting orders", error });
  }
};

export const getOrderByid = async (req, reply) => {
  try {
    const { orderId } = req.query;

    const order = await Order.findById(orderId).populate(
      "customer branch items.item deliveryPartner"
    );
    if (!order) return reply.status(404).send({ message: "Order not found" });
    return reply.status(200).send(order);
  } catch (error) {
    return reply.status(500).send({ message: "Error getting orders", error });
  }
};
