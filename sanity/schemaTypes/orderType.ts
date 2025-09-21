import { defineArrayMember, defineField, defineType } from "sanity";
import { BasketIcon } from "@sanity/icons";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "razorpayOrderId",
      title: "Razorpay Order ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "razorpayPaymentId",
      title: "Razorpay Payment ID",
      type: "string",
    }),
    defineField({
      name: "razorpaySignature",
      title: "Razorpay Signature",
      type: "string",
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Bought",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",
      fields: [
        defineField({ name: "state", title: "State", type: "string" }),
        defineField({ name: "zip", title: "Zip Code", type: "string" }),
        defineField({ name: "city", title: "City", type: "string" }),
        defineField({ name: "address", title: "Address", type: "string" }),
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "contact", title: "Contact", type: "string" }),
      ],
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Paid", value: "paid" },
          { title: "Shipped", value: "shipped" },
          { title: "Out for Delivery", value: "out_for_delivery" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Refund Requested", value: "refund_requested" },
          { title: "Refund Processing", value: "refund_processing" },
          { title: "Refunded", value: "refunded" },
        ],
      },
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    // Cancellation fields
    defineField({
      name: "cancellationReason",
      title: "Cancellation Reason",
      type: "string",
      hidden: ({ parent }) => parent?.status !== 'cancelled',
    }),
    defineField({
      name: "cancelledAt",
      title: "Cancelled At",
      type: "datetime",
      hidden: ({ parent }) => parent?.status !== 'cancelled',
    }),
    defineField({
      name: "cancellationDeadline",
      title: "Cancellation Deadline",
      type: "datetime",
      description: "Last time this order can be cancelled",
    }),
    // Return/Refund fields
    defineField({
      name: "returnRequest",
      title: "Return Request",
      type: "object",
      fields: [
        defineField({
          name: "reason",
          title: "Return Reason",
          type: "string",
          options: {
            list: [
              { title: "Damaged Item", value: "damaged" },
              { title: "Wrong Item", value: "wrong_item" },
              { title: "Size Issue", value: "size_issue" },
              { title: "Quality Issue", value: "quality_issue" },
              { title: "Not as Described", value: "not_described" },
              { title: "Changed Mind", value: "changed_mind" },
              { title: "Other", value: "other" },
            ],
          },
        }),
        defineField({
          name: "description",
          title: "Return Description",
          type: "text",
        }),
        defineField({
          name: "requestedAt",
          title: "Requested At",
          type: "datetime",
        }),
        defineField({
          name: "images",
          title: "Return Images",
          type: "array",
          of: [{ type: "image" }],
        }),
        defineField({
          name: "refundAmount",
          title: "Refund Amount",
          type: "number",
        }),
        defineField({
          name: "refundMethod",
          title: "Refund Method",
          type: "string",
          options: {
            list: [
              { title: "Original Payment Method", value: "original" },
              { title: "Bank Transfer", value: "bank_transfer" },
              { title: "Wallet", value: "wallet" },
            ],
          },
        }),
      ],
      hidden: ({ parent }) => !['refund_requested', 'refund_processing', 'refunded'].includes(parent?.status),
    }),
    // Shiprocket tracking
    defineField({
      name: "shiprocketOrderId",
      title: "Shiprocket Order ID",
      type: "string",
    }),
    defineField({
      name: "awbCode",
      title: "AWB Code",
      type: "string",
      description: "Air Waybill number for tracking",
    }),
    defineField({
      name: "courierName",
      title: "Courier Name",
      type: "string",
    }),
    defineField({
      name: "trackingUrl",
      title: "Tracking URL",
      type: "url",
    }),
    defineField({
      name: "estimatedDelivery",
      title: "Estimated Delivery Date",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "customerEmail",
      status: "status",
    },
    prepare(select) {
      return {
        title: `${select.name} (${select.orderId})`,
        subtitle: `${select.amount} ${select.currency}, ${select.email}`,
        media: BasketIcon,
      };
    },
  },
});