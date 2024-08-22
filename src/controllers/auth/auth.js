import jwt from "jsonwebtoken";
import { Customer, DeliveryPartner } from "../../models/user.js";

const generateToken = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });
      await customer.save();
    }

    const { accessToken, refreshToken } = generateToken(customer);
    return reply.send({
      message: customer
        ? "Login Successfully"
        : "Customer created and logged in successfully",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Server Error", error });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;
    let deliveryPartner = await DeliveryPartner.findOne({ email });
    if (!deliveryPartner) {
      reply.status(404).send({ message: "Delivery partner not found" });
    }

    const isMatch = password === deliveryPartner.password;
    if (!isMatch) {
      return reply.status(404).send({ message: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateToken(deliveryPartner);
    return reply.send({
      message: deliveryPartner
        ? "Login Successfully"
        : "Delivery partner created and loggedIn successfully",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error", error });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return reply.status(401).send({ message: "Refresh token Required" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let user;
    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "Invalid refresh token" });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
    return reply.send({
      message: "Token refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return reply.status(403).send({ message: "Invalid refresh Token" });
  }
};

export const fetchUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    let user;
    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(403).send({ message: "Invalid Role" });
    }
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.send({ message: "User fetched successfully", user });
  } catch (error) {
    res.status(500).send({ message: "An error occurred", error });
  }
};
