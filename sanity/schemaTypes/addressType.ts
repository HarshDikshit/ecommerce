import { defineField, defineType } from "sanity";

export const addressType = defineType({
    name: 'address',
    title: 'Address',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Address name',
            type: 'string',
            description: 'A friendly name for the address (e.g., "Home", "Work")',
            validation: (Rule) => Rule.required().max(50).error('Address name is required and should not exceed 50 characters.'),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'email',
        }),
        defineField({
            name: 'address',
            title: 'Street Address',
            type: 'string',
            description: 'The street address (e.g., "123 Main St, Apt 4B")',
            validation: (Rule) => Rule.required().max(200).error('Street address is required and should not exceed 200 characters.'),
        }),
        defineField({
            name: 'city',
            title: 'City',
            type: 'string',
            validation: (Rule) => Rule.required().max(100).error('City is required and should not exceed 100 characters.'),
        }),
        defineField({
            name: 'state',
            title: 'State/Province',
            type: 'string',
            description: 'The state',
            validation: (Rule) => Rule.required().max(100).error('State/Province is required and should not exceed 100 characters.'),
        }),
        defineField({
            name: 'zip',
            title: 'ZIP/Postal Code',
            type: 'string',
            description: 'The ZIP or postal code',
        }),
        defineField({
            name: 'default',
            title: 'Default Address',
            type: 'boolean',
            description: 'Is this address your default shipping address',
            initialValue: false,
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: (new Date()).toISOString(),
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: 'name',  
            subtitle: 'address',
            city: 'city',
            state: 'state',
            isDefault: 'default',
        },
        prepare(selection) {
            const { title, subtitle, city, state, isDefault } = selection;
            return {
                title: `${title || 'Unnamed Address'}${isDefault ? ' (Default)' : ''}`,
                subtitle: `${subtitle || 'No address'}, ${city || ''} ${state || ''}`.trim().replace(/,\s*$/, ''),
                media: isDefault ? '⭐' : undefined,
            };
        },
    },
});