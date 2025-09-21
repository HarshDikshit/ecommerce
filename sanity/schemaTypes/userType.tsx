import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export const userType = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      description: "Unique Clerk ID for authentication",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "url",
      description: "Profile picture from Google/Clerk",
    }),
    defineField({
      name: "mobile",
      title: "Mobile Number",
      type: "string",
      description: "Optional mobile number",
    }),
    defineField({
      name: "addresses",
      title: "Addresses",
      type: "array",
      of: [{ type: "reference", to: [{ type: "address" }] }],
    }),
    defineField({
      name: "orders",
      title: "Orders",
      type: "array",
      of: [{ type: "reference", to: [{ type: "order" }] }],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "avatar",
    },
  },
});
