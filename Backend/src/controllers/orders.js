import OrdersDataAcess from "../dataAccess/orders.js";
import { ok, serverError } from "../helpers/httpResponse.js";

export default class OrdersControllers {
  constructor() {
    this.dataAcess = new OrdersDataAcess();
  }

  async getOrders() {
    try {
      const orders = await this.dataAcess.getOrders();
      return ok(orders);
    } catch (error) {
      return serverError(error);
    }
  }

  async getOrdersByUserId(userId) {
    try {
      const orders = await this.dataAcess.getOrdersByUserId(userId);
      return ok(orders);
    } catch (error) {
      return serverError(error);
    }
  }

    async addOrder(orderData) {
    try {
      const result = await this.dataAcess.addOrder(orderData);
      return ok(result);
    } catch (error) {
      return serverError(error);
    }
  }

  async deleteOrder(orderId) {
    try {
      const result = await this.dataAcess.deleteOrder(orderId);
      return ok(result);
    } catch (error) {
      return serverError(error);
    }
  }

  async updateOrder(orderId, orderData) {
    try {
      const result = await this.dataAcess.updateOrder(orderId, orderData);

      if (!result.value) {
      return {
        success: false,
        statusCode: 404,
        body: { message: "Order não encontrada" },
      };
    }

      return ok(result);
      
    } catch (error) {
      return serverError(error);
    }
  }
}
