import { defineType, defineField } from "sanity";

export const carouselTypes = defineType({
  name: "carousel",
  title: "Carousel",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "image",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "string",
    }),
    defineField({
      name: "buttonVariant",
      title: "Button Variant",
      type: "string",
      options: {
        list: [
          { title: "Filled", value: "filled" },
          { title: "Outline", value: "outline" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "buttonLink",
      title: "Button Link",
      type: "url",
    }),
  ],
});
