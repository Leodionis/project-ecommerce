const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  virtuals: {
    variants: {
      options: {
        ref: 'ProductVariant',
        localField: '_id',
        foreignField: 'productId'
      }
    },
    createdBy: {
      options: {
        ref: 'User',
        localField: 'userId',
        foreignField: '_id',
        justOne: true
      }
    }
  },
  toJSON: {
    virtuals: true,
    transform: function (_, ret) {
      delete ret.userId;
    }
  }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;