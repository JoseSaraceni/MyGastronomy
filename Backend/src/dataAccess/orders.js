import { Mongo } from "../database/mongo.js";
import { ObjectId, ReturnDocument } from "mongodb";

const collectionName = "orders";

export default class OrdersDataAcess {
  async getOrders() {
    const result = await Mongo.db
    .collection(collectionName)
    .aggregate([
      {
        $lookup: {
          from: 'orderItems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'orderItems'
        }
      },

      {

        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },

      {
        $project: {
          'userDetails.password': 0,
          'userDetails.salt': 0,
        }
      },

      {
        $unwind: '$orderItems'
      },

      {
        $lookup: {
          from: 'plates',
          localField: 'orderItems.plateId',
          foreignField: '_id',
          as: 'orderItems.itemDetails'
        }
      },

      {
        $group: {
          _id: '$_id',
          userDetails: { $first: '$userDetails'},
          orderItems: {$push: '$orderItems'},
          pickupStatus: {$first: '$pickupStatus'},
          pickupTime: {$push: '$pickupTime'}
        }
      }

    ])

    .toArray();

    return result;
  }

  async getOrdersByUserId(userId) {
  const result = await Mongo.db
    .collection(collectionName)
    .aggregate([
      {
        $match: { userId: new ObjectId(userId) }
      },

      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems"
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },

      {
        $project: {
          "userDetails.password": 0,
          "userDetails.salt": 0
        }
      },

      {
        $unwind: "$orderItems"
      },

      {
        $lookup: {
          from: "plates",
          localField: "orderItems.plateId",
          foreignField: "_id",
          as: "plateDetails"
        }
      },

      {
        $unwind: {
          path: "$plateDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $addFields: {
          "orderItems.itemDetails": "$plateDetails"
        }
      },

      {
        $group: {
          _id: "$_id",
          userDetails: { $first: "$userDetails" },
          pickupStatus: { $first: "$pickupStatus" },
          pickupTime: { $first: "$pickupTime" },
          orderItems: { $push: "$orderItems" }
        }
      }
    ])
    .toArray();

  return result;
}


async addOrder(orderData) {
  const { items, ...orderDataRest } = orderData

  orderDataRest.createdAt = new Date()
  orderDataRest.pickupStatus = 'Pending'
  orderDataRest.userId = new ObjectId(orderDataRest.userId)

  const newOrder = await Mongo.db
    .collection(collectionName)
    .insertOne(orderDataRest)

  if (!newOrder.insertedId) {
    throw new Error('Order cannot be inserted')
  }

  items.forEach(item => {
    item.plateId = new ObjectId(item.plateId)
    item.orderId = newOrder.insertedId
  })

  return await Mongo.db
    .collection('orderItems')
    .insertMany(items)
}


  async deleteOrder(orderId) {

    const itemsToDelete = await Mongo.db
    .collection('orderItems')
    .deleteMany({orderId: new ObjectId(orderId)})

    const orderToDelete = await Mongo.db
      .collection(collectionName)
      .findOneAndDelete({ _id: new ObjectId(orderId) });

    const result = {
      itemsToDelete,
      orderToDelete
    }
    return result;
  }
  

  async updateOrder(orderId, orderData) {
    if (orderId && orderData) {
      const result = await Mongo.db
        .collection(collectionName)
        .findOneAndUpdate({ _id: new ObjectId(orderId) }, { $set: orderData }, {returnDocument: "after"});

      return result;
    }
  }
}
