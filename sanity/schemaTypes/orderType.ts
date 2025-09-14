import { defineArrayMember, defineField, defineType } from "sanity";
import { BasketIcon } from "@sanity/icons";

export const orderType = defineType({
  name: 'order',
  title: 'Order',
    type: 'document',
    fields: [
        defineField({
            name: 'orderNumber',
            title: 'Order Number',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'invoice', 
            type: 'object',
            fields: [
                {name:'id', type: 'string'},
                {name:'hosted_invoice_url', type: 'url'},
                {name: 'number', type: 'string'},
            ],
        }),
        defineField({
            name: 'stripeCheckoutSessionId',
            title: 'Stripe Caption Session ID',
            type: 'string',
        }),
        defineField({
            name: 'stripeCustomerId',
            title: 'Stripe Customer ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'clerkUserId',
            title: 'Clerk User ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'customerName',
            title: "Customer Name",
            type: 'string',
            validation: (Rule)=>  Rule.required(),
        }),
        defineField({
            name: 'customerEmail',
            title: "Customer Email",
            type: 'string',
            validation: (Rule)=>  Rule.required().email(),
        }),
        defineField({
            name: 'stripePaymentIntentId',
            title: "Stripe Payment Intent ID",
            type: 'string',
            validation: (Rule)=>  Rule.required(),
        }),
        defineField({
            name: 'products',
            title: "Products",
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'product',
                            title: 'Product Bought',
                            type: 'reference',
                            to: [{type: 'product'}]
                        }),
                        defineField({
                            name: 'quantity',
                            title:  'Quantity Purchased',
                            type: 'number'
                        }),
                    ],
                    preview: {
                        select: {
                            product: 'product.name',
                            quantity: 'quantity',
                            image: 'product.image',
                            price: 'product.price',
                            currency:  'product.currency',
                        },
                        prepare(select) {
                            return {
                                title: `${select.product} x ${select.quantity}`,
                                subtitle: `${select.price * select.quantity} `,
                                media: select.image,
                            }
                        }
                    }
                }),
            ],
        }),
        defineField({
            name: 'totalPrice',
            title: 'Total Price',
            type: 'number',
            validation: (Rule)=> Rule.required().min(0),
        }),
        defineField({
            name: 'currency',
            title: 'Currency',
            type: 'string',
            validation: (Rule)=> Rule.required(),
        }),
        defineField({
            name: 'amountDiscount',
            title: 'Amount  Discount',
            type: 'number',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "address",
            title: 'Shipping Address',
            type: 'object',
            fields: [
                defineField({ name: 'state', title: 'State', type: 'string'}),
                defineField({ name: 'zip', title: 'Zip Code', type: 'string'}),
                defineField({ name: 'city', title: 'City', type: 'string'}),
                defineField({ name: 'address', title: 'Address', type: 'string'}),
                defineField({ name: 'name', title: 'Name', type: 'string'}),
            ],
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    {title: 'Pending', value: 'pending'},
                    {title: 'Processing', value: 'processing'},
                    {title: 'Paid', value: 'paid'},
                    {title: 'Shipped', value: 'shipped'},
                    {title: 'Out for Delievery', value: 'out_for_delievery'},
                    {title: 'Delivered', value: 'delivered'},
                    {title: 'Cancelled', value: 'cancelled'},
                ]
            }
        }),
        defineField({
            name: 'oderDate',
            title: 'Order Date',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            name: 'customerName',
            amount: 'totalPrice',
            currency: 'currency',
            orderId: 'orderNumber',
            email: 'email',
            status: 'status',
        },
        prepare(select) {
            return {
                title: `${select.name} (${select.orderId})`,
                subtitle: `${select.amount} ${select.currency}, ${select.email}`, 
                media: BasketIcon,
            }
        }
    }
})
