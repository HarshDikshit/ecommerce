import { defineField, defineType } from "sanity";
import { TrolleyIcon } from "@sanity/icons";
import { subscribe } from "diagnostics_channel";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stock",
      title: "Stock Quantity",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "isGallery",
      type: "boolean",
      title: "Is Gallery?",
      initialValue: false,
    }),
    defineField({
      name: "galleryImage",
      type: "image",
      title: "Gallery Image",
      hidden: ({ parent }) => !parent?.isGallery, // show only when isGallery = true
      options: {
        hotspot: true, // optional, for cropping
      },
    }),
    defineField({
      name: "status",
      title: "Product Status",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "New Arrival", value: "New Arrival" },
          { title: "Hot", value: "Hot" },
          { title: "Best Seller", value: "Best Seller" },
        ],
      },
    }),
    defineField({
      name: "bead",
      title: "Bead Type",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Rudraksha", value: "rudraksha" },
          { title: "Karungali", value: "karungali" },
          { title: "Pyrite", value: "pyrite" },
          { title: "Sandalwood", value: "sandalwood" },
          { title: "Tulsi", value: "tulsi" },
          { title: "Sphatik", value: "sphatik" },
          { title: "Rose Quartz", value: "rose-quartz" },
        ],
      },
    }),
    defineField({
      name: "purpose",
      title: "Purpose Type",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Health", value: "health" },
          { title: "Wealth", value: "wealth" },
          { title: "Peace", value: "peace" },
          { title: "Love", value: "love" },
          { title: "Protection", value: "protection" },
          { title: "Balance", value: "balance" },
          { title: "Courage", value: "courage" },
        ],
      },
    }),
    defineField({
      name: "isFeatured",
      title: "Featured Product",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images",
      subtitle: "price",
    },
    prepare(selection) {
      const { title, media, subtitle } = selection;
      const image = media && media[0]; // Use the first image in the array
      return {
        title: title || "Unnamed Product",
        media: image,
        subtitle: subtitle,
      };
    },
  },
});
