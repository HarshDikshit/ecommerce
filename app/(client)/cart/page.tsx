"use client";
import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceView from "@/components/PriceView";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Address, Product } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
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
import AddressPage from "@/components/Address";
import { currentUser } from "@clerk/nextjs/server";

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubtotalPrice,
    resetCart,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItem());
  const { user } = useUser();
  const { isSignedIn, userId } = useAuth();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const query = `*[_type=="address" && userId==$userId] | order(createdAt desc)`;
      const data = await client.fetch(query, { userId: userId });
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

 // Enhanced handleCheckOut with automatic cleanup timer
  const handleCheckOut = async ({ price }: { price: number }) => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    setLoading(true);
    let sanityOrderId: string | null = null;
    let cleanupTimer: NodeJS.Timeout | null = null;

    try {
      // Prepare order data
      const orderData = {
        amount: price,
        currency: "INR",
        customerName: user.fullName || user.firstName || "Customer",
        customerEmail: user.primaryEmailAddress?.emailAddress || "",
        address: {
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          contact: selectedAddress.contact,
        },
        products: groupedItems.map(({ product }) => ({
          productId: product._id,
          quantity: getItemCount(product._id),
        })),
        amountDiscount: Math.round(getSubtotalPrice() - getTotalPrice()),
      };

      // Create order
      const { data } = await axios.post("/api/razorpay", orderData);

      if (!data.success) {
        throw new Error("Failed to create order");
      }

      sanityOrderId = data.sanityOrderId;

      // Set up automatic cleanup after 15 minutes
      cleanupTimer = setTimeout(
        async () => {
          console.log("Auto-cleaning up abandoned order after 15 minutes");
          if (sanityOrderId) {
            try {
              await fetch(`/api/orders/${sanityOrderId}/cleanup`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              console.log("Abandoned order cleaned up automatically");
            } catch (error) {
              console.error("Auto-cleanup failed:", error);
            }
          }
        },
        15 * 60 * 1000
      ); // 15 minutes

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "My E-commerce App",
        description: `Order ${data.orderNumber}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Clear the cleanup timer since payment was successful
          if (cleanupTimer) {
            clearTimeout(cleanupTimer);
            cleanupTimer = null;
          }

          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(verificationData),
            });

            if (!verifyRes.ok) {
              throw new Error(
                `Verification request failed with status: ${verifyRes.status}`
              );
            }

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              resetCart();
              toast.success(
                `Payment successful! Order ${verifyData.orderNumber || data.orderNumber} placed.`
              );
              window.location.href = "/order";
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error(
              "Payment verification failed. Please contact support if amount was deducted."
            );
          }
        },
        modal: {
          ondismiss: async function () {
            console.log("Payment modal dismissed");

            // Clear the automatic cleanup timer
            if (cleanupTimer) {
              clearTimeout(cleanupTimer);
              cleanupTimer = null;
            }

            // Immediate cleanup on modal dismiss
            if (sanityOrderId) {
              try {
                await fetch(`/api/orders/${sanityOrderId}/cleanup`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                console.log("Pending order cleaned up on modal dismiss");
              } catch (cleanupError) {
                console.error("Failed to cleanup pending order:", cleanupError);
              }
            }

            setLoading(false);
          },
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: selectedAddress.contact || "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function (response: any) {
        console.error("Payment failed:", response.error);

        // Clear the cleanup timer
        if (cleanupTimer) {
          clearTimeout(cleanupTimer);
          cleanupTimer = null;
        }

        // Clean up on payment failure
        if (sanityOrderId) {
          try {
            await fetch(`/api/orders/${sanityOrderId}/cleanup`, {
              method: "DELETE",
            });
          } catch (cleanupError) {
            console.error(
              "Failed to cleanup after payment failure:",
              cleanupError
            );
          }
        }

        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Checkout error:", err);

      // Clear timer and cleanup on checkout error
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
      }

      if (sanityOrderId) {
        try {
          await fetch(`/api/orders/${sanityOrderId}/cleanup`, {
            method: "DELETE",
          });
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup after checkout error:",
            cleanupError
          );
        }
      }

      toast.error(err.message || "Failed to initiate payment");
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
                  <AddressPage
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    setAddresses={setAddresses}
                    setSelectedAddress={setSelectedAddress}
                  />
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
              </div>
            </div>
          </Container>
        : <EmptyCart />
      : <NoAccess />}
    </div>
  );
};

export default CartPage;
