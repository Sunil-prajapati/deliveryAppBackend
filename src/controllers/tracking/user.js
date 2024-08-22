import { Customer, DeliveryPartner } from "../../models/user.js";

export const updateUser = async (req, reply) => {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    let user =
      (await Customer.findById(userId)) ||
      (await DeliveryPartner.findById(userId));
    if (!user) return reply.status(404).send({ message: "User not found" });

    let UserModal;
    if (user.role === "Customer") {
      UserModal = Customer;
    } else if (user.role === "DeliveryPartner") {
      UserModal = DeliveryPartner;
    } else {
      return reply.status(403).send({ message: "Invalid user role" });
    }
    const updateUser = await UserModal.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updateUser) {
      return reply.status(404).send({ message: "User not found" });
    }
    return reply.send({
      message: "User updated successfully",
      user: updateUser,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Failed to update user", error });
  }
};
