"use client";

import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceView from "@/components/PriceView";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Address, Product } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
import Card from "@mui/material/Card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Razorpay from "razorpay";

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubtotalPrice,
    resetCart,
  } = useStore();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItem());

  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const query = `*[_type=="address"] | order(createdAt desc)`;
      const data = await client.fetch(query);
      setAddresses(data);
      const defaultAddress = data.find((addr: Address) => addr.default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.lenght > 0) {
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

  const handleResetCart = () => {
    const confirm = window.confirm("Are you sure you want to reset your cart?");
    if (confirm) {
      resetCart();
      toast.success("Cart reset successfully!");
    }
  };

  const handleCheckOut = async ({ price }: { price: number }) => {
    setLoading(true);
    try {
      // Call backend to create order
      const { data } = await axios.post("/api/razorpay", {
        amount: price, // Rs. 500
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: price * 100,
        currency: "INR",
        name: "My E-commerce App",
        description: "Test Transaction",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const data = await verifyRes.json();

            if (data.success) {
              alert("✅ Payment Verified & Successful!");
              // TODO: update order status in your DB
            } else {
              alert("❌ Payment Verification Failed");
            }
          } catch (err) {
            console.error(err);
            alert("Something went wrong during verification.");
          }
        },

        prefill: {
          name: "Harsh Dixit",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      {isSignedIn ?
        groupedItems?.length ?
          <Container>
            <div className="flex items-center gap-2 py-5">
              <ShoppingBag className="text-black" />
              <h2 className="font-bold text-2xl ">Shopping Cart</h2>
            </div>
            <div className="grid md:grid-cols-3 md:gap-8">
              <div className="lg:col-span-2 rounded-lg">
                <div className="border bg-white rounded-md ">
                  {groupedItems?.map(({ product }) => {
                    const itemCount = getItemCount(product?._id);
                    console.log(product?.imagesArray?.[0]);

                    return (
                      <div
                        className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        key={product?._id}
                      >
                        <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                          {product?.images && (
                            <Link
                              href={`/product/${product?.slug?.current}`}
                              className="border p-0.5 md:p-1 mr-2 rounded-md overflow-hidden group"
                            >
                              <Image
                                src={urlFor(product?.images[0]).url()}
                                alt="product"
                                height={500}
                                width={500}
                                loading="lazy"
                                className="w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 hoverEffect "
                              />
                            </Link>
                          )}
                          <div className="h-full flex flex-1 flex-col justify-between py-1">
                            <div className="flex flex-col gap-0.5 md:gap-1.5">
                              <h2 className="text-base font-semibold line-clamp-1">
                                {product?.name}
                              </h2>
                              <p className="text-sm capitalize line-clamp-1">
                                Category:{" "}
                                <span className="font-semibold ">
                                  {product?.Category?.title}
                                </span>
                              </p>
                              <p className="text-sm capitalize ">
                                Status:{" "}
                                <span className="font-semibold">
                                  {product?.status?.[0]}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <ProductSideMenu
                                      product={product}
                                      className="relative top-0 right-0"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="font-bold text-white bg-black p-1 rounded-md text-xs">
                                    Add to Favorite
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Trash
                                      onClick={() => {
                                        deleteCartProduct(product?._id);
                                        toast.success(
                                          "Product deleted successfully!"
                                        );
                                      }}
                                      className="w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="font-bold text-white bg-black p-1 rounded-md text-xs">
                                    Delete
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                        <div className="flex  flex-col justify-between items-start h-36 md:h-44 p-0.5 md:p-1">
                          <PriceView
                            price={product?.price as number}
                            discount={product?.discount as number}
                            className="font-bold text-lg"
                          />
                          <QuantityButtons product={product} />
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    onClick={handleResetCart}
                    className="m-5 font-semibold"
                    variant={"destructive"}
                  >
                    Reset Cart
                  </Button>
                </div>
              </div>
              <div>
                <div className="lg:col-span-1">
                  <div className="hidden md:inline-block w-full  bg-white p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">
                      Order Summary
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <PriceView price={Math.round(getSubtotalPrice())} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Discount</span>
                        <PriceView
                          price={Math.round(
                            getSubtotalPrice() - getTotalPrice()
                          )}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span>Total</span>
                        <PriceView
                          price={useStore?.getState().getTotalPrice()}
                          className="font-bold text-lg text-black"
                        />
                      </div>
                      <Button
                        className="w-full rounded-full font-semibold tracking-wide"
                        size={"lg"}
                        disabled={loading}
                        onClick={() =>
                          handleCheckOut({
                            price: useStore?.getState().getTotalPrice(),
                          })
                        }
                      >
                        {loading ? "Please Wait..." : "Proceed to Checkout"}
                      </Button>
                    </div>
                  </div>
                  {addresses && (
                    <div className="bg-white rounded-md mt-5">
                      <Card className="py-3">
                        <CardHeader>
                          <CardTitle>Delievery Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RadioGroup
                            defaultValue={addresses
                              ?.find((addr) => addr?.default)
                              ?._id.toString()}
                          >
                            {addresses?.map((address: any) => (
                              <div
                                key={address?._id}
                                className={`flex items-center space-x-2 mb-4 cursor-pointer ${selectedAddress?._id === address?._id && "text-black/90"}`}
                                onClick={() => setSelectedAddress(address)}
                              >
                                <RadioGroupItem
                                  value={address?._id.toString()}
                                />
                                <Label
                                  htmlFor={`address-${address?._id}`}
                                  className="grid gap-1.5 flex-1 "
                                >
                                  <span className="font-semibold ">
                                    {address?.name}
                                  </span>
                                  <span className="text-sm text-black/60">
                                    {address?.address}, {address?.city},{" "}
                                    {address?.state}, {address?.zip}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          <Button variant={"outline"} className="w-full mt-4 ">
                            Add New Address
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:hidden fixed bottom-0 left-0 w-full  p-2 ">
                <div className="bg-white p-4 rounded-lg border mx-4 ">
                  <h2>Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <PriceView price={Math.round(getSubtotalPrice())} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Discount</span>
                      <PriceView
                        price={Math.round(getSubtotalPrice() - getTotalPrice())}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <PriceView
                        price={useStore?.getState().getTotalPrice()}
                        className="font-bold text-lg text-black"
                      />
                    </div>
                    <Button
                      className="w-full rounded-full font-semibold tracking-wide"
                      size={"lg"}
                      disabled={loading}
                    >
                      {loading ? "Please Wait..." : "Proceed to Checkout"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        : <EmptyCart />
      : <NoAccess />}
    </div>
  );
};

export default CartPage;
