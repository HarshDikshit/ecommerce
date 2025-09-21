"use client";

import React, { useEffect, useState } from "react";
import { Card, CardTitle, CardHeader, CardContent } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Address } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { useUser } from "@clerk/nextjs";
import { createAddress } from "@/app/actions/addressActions";
import { deleteAddress } from "@/app/actions/addressActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Trash2 } from "lucide-react";

const STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
];

const AddressPage = ({
  addresses,
  selectedAddress,
  setAddresses,
  setSelectedAddress,
}: {
  addresses: Address[] | null;
  selectedAddress: Address | null;
  setAddresses: React.Dispatch<React.SetStateAction<Address[] | null>>;
  setSelectedAddress: React.Dispatch<React.SetStateAction<Address | null>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useUser();
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    default: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let sanitizedValue = value;

    // Sanitize different fields
    if (name === "contact") {
      sanitizedValue = value.replace(/[^0-9+\-\s()]/g, "");
    } else if (name === "name") {
      // Remove potentially problematic characters from name
      sanitizedValue = value.replace(/[<>\"']/g, "");
    } else if (name === "address" || name === "city") {
      // Remove script-like characters but allow common address characters
      sanitizedValue = value.replace(/[<>\"']/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : sanitizedValue,
    }));
  };

  const validateForm = (formData: typeof form) => {
    const errors: string[] = [];

    // Validate contact
    if (formData.contact && !/^[+]?[0-9\s\-()]+$/.test(formData.contact)) {
      errors.push("Contact number contains invalid characters");
    }

    // Validate name
    if (!/^[a-zA-Z0-9\s\-.,]+$/.test(formData.name)) {
      errors.push("Name contains invalid characters");
    }

    // Validate address
    if (!/^[a-zA-Z0-9\s\-.,#/]+$/.test(formData.address)) {
      errors.push("Address contains invalid characters");
    }

    // Validate city
    if (!/^[a-zA-Z\s\-.']+$/.test(formData.city)) {
      errors.push("City name contains invalid characters");
    }

    return errors;
  };
  console.log(user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form before submitting
    const validationErrors = validateForm(form);
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
      return;
    }

    const optimisticAddress: Address = {
      _id: Math.random().toString(),
      _type: "address",
      userId: user.id,
      name: form.name.trim(),
      email: form.email.trim(),
      contact: form.contact.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state,
      zip: form.zip.trim(),
      default: form.default,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setAddresses((prev) =>
      prev ? [optimisticAddress, ...prev] : [optimisticAddress]
    );
    setSelectedAddress(optimisticAddress);

    // Close dialog immediately
    setOpen(false);

    try {
      const saved = (await createAddress(form)) as Address;
      setAddresses((prev) =>
        prev ?
          prev.map((addr) =>
            addr._id === optimisticAddress._id ? saved : addr
          )
        : [saved]
      );
      setSelectedAddress(saved);
    } catch (err) {
      console.error("Failed to save address:", err);

      // Rollback if fails
      setAddresses((prev) =>
        prev ? prev.filter((addr) => addr._id !== optimisticAddress._id) : []
      );
    }

    // Reset form
    setForm({
      name: "",
      email: "",
      contact: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      default: false,
    });
  };

  const handleDeleteClick = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent radio button selection
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    setDeletingId(addressToDelete?._id as string);

    try {
      await deleteAddress(addressToDelete?._id as string);

      // Remove from addresses list
      setAddresses((prev) =>
        prev ? prev.filter((addr) => addr._id !== addressToDelete._id) : []
      );

      // If deleted address was selected, select another one
      if (selectedAddress?._id === addressToDelete._id) {
        const remainingAddresses =
          addresses?.filter((addr) => addr._id !== addressToDelete._id) || [];

        if (remainingAddresses.length > 0) {
          // Select the first default address or the first address
          const newSelected =
            remainingAddresses.find((addr) => addr.default) ||
            remainingAddresses[0];
          setSelectedAddress(newSelected);
        } else {
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      // You might want to show a toast/notification here
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const query = `*[_type=="address"] | order(createdAt desc)`;
      const data = await client.fetch(query);
      setAddresses(data);
      const defaultAddress = data.find((addr: Address) => addr.default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.log("Addresses fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  return (
    <div>
      {addresses ?
        <div className="bg-white rounded-md mt-5">
          <Card className="py-3">
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue={addresses
                  ?.find((addr) => addr?.default)
                  ?._id?.toString()}
              >
                {addresses?.map((address: any) => (
                  <div
                    key={address?._id}
                    className={`flex items-center space-x-2 mb-4 cursor-pointer group relative ${
                      selectedAddress?._id === address?._id && "text-black/90"
                    }`}
                    onClick={() => setSelectedAddress(address)}
                  >
                    <RadioGroupItem value={address?._id.toString()} />
                    <Label
                      htmlFor={`address-${address?._id}`}
                      className="grid gap-1.5 flex-1"
                    >
                      <span className="font-semibold">{address?.name}</span>
                      <span className="text-sm text-black/60">
                        {address?.address}, {address?.city}, {address?.state},{" "}
                        {address?.zip}
                      </span>
                    </Label>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-80 group-hover:opacity-100 transition-opacity p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDeleteClick(address, e)}
                      disabled={deletingId === address._id}
                    >
                      {deletingId === address._id ?
                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                      : <Trash2 color={'red'} className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <Button
                onClick={() => setOpen(true)}
                variant={"outline"}
                className="w-full mt-4 "
              >
                Add New Address
              </Button>
            </CardContent>
          </Card>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Mobile No</Label>
                  <Input
                    type="tel"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    pattern="[+]?[0-9\s\-()]+"
                    title="Please enter a valid phone number"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Street Address</Label>
                  <Input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>State/Province</Label>
                  <Select
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, state: val }))
                    }
                    value={form.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ZIP/Postal Code</Label>
                  <Input name="zip" value={form.zip} onChange={handleChange} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="default"
                    name="default"
                    checked={form.default}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, default: !!checked }))
                    }
                  />
                  <Label htmlFor="default">Set as default address</Label>
                </div>
                <Button type="submit" className="w-full">
                  Save Address
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{addressToDelete?.name}"?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      : <div>No Address found for your Account</div>}
    </div>
  );
};

export default AddressPage;
