import { defineField, defineType } from "sanity"

export const commentTypes = defineType ({
  name: "comment",
  title: "Comment",
  type: "document",
  fields: [
    defineField({
        name: "text",
        title: "Text", 
        type: "text" 
    }),
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({ 
        name: "authorClerkId", 
        title: "Author Clerk ID", 
        type: "string" 
    }),
    defineField({
      name: "authorName",
      title: "Author Name",
      type: "string",
    }),
    defineField({ 
        name: "rating", 
        title: "Rating", 
        type: "number" 
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
    preview: {
    select: {
      text: "text",
      media: "images",
      subtitle: "rating",
    },
    prepare(selection) {
      const { text, media, subtitle } = selection;
      const image = media && media[0]; // Use the first image in the array
      return {
        title: text || "Unnamed Product",
        media: image,
        subtitle: subtitle,
      };
    },
  },
});
