// Try this minimal schema first to isolate the issue
import { defineField, defineType } from "sanity";

export const addressType = defineType({
  name: "address",
  title: "Address", 
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Address name",
      type: "string",
    }),
    defineField({
      name: "userId", 
      title: "User Clerk ID",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email", 
      type: "string",
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "string", 
    }),
    defineField({
      name: "address",
      title: "Street Address",
      type: "string",
    }),
    defineField({
      name: "city", 
      title: "City",
      type: "string",
    }),
    defineField({
      name: "state",
      title: "State/Province", 
      type: "string",
    }),
    defineField({
      name: "zip",
      title: "ZIP/Postal Code",
      type: "string", 
    }),
    defineField({
      name: "default",
      title: "Default Address",
      type: "boolean",
    }),
    defineField({
      name: "createdAt", 
      title: "Created At",
      type: "datetime",
      initialValue: Date.now().toLocaleString(),
    }),
  ],
});