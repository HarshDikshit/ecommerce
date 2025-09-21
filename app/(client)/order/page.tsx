"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RotateCcw,
  Eye,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    images?: any[];
    price: number;
    slug?: { current: string };
  };
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  currency: string;
  status: string;
  orderDate: string;
  address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  products: OrderProduct[];
  razorpayPaymentId?: string;
  cancellationDeadline?: string;
  awbCode?: string;
  trackingUrl?: string;
  courierName?: string;
  returnRequest?: {
    reason: string;
    description: string;
    requestedAt: string;
  };
}

const OrdersPage = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cancel order dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Return order dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");

  // Tracking dialog state
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  // Mock orders data with enhanced fields
//   const mockOrders: Order[] = [
//     {
//       _id: "1",
//       orderNumber: "ORD-1234567890-AB12",
//       customerName: "John Doe",
//       customerEmail: "john@example.com",
//       totalPrice: 2499,
//       currency: "INR",
//       status: "delivered",
//       orderDate: "2024-01-15T10:30:00Z",
//       cancellationDeadline: "2024-01-16T10:30:00Z",
//       awbCode: "1234567890123",
//       trackingUrl: "https://track.example.com/1234567890123",
//       courierName: "BlueDart",
//       address: {
//         name: "Home",
//         address: "123 Main Street, Apartment 4B",
//         city: "Mumbai",
//         state: "Maharashtra",
//         zip: "400001"
//       },
//       products: [
//         {
//           product: {
//             _id: "prod1",
//             name: "Rudraksha Mala Premium Quality",
//             price: 1999,
//             slug: { current: "rudraksha-mala-premium" }
//           },
//           quantity: 1
//         },
//         {
//           product: {
//             _id: "prod2", 
//             name: "Sandalwood Bracelet",
//             price: 500,
//             slug: { current: "sandalwood-bracelet" }
//           },
//           quantity: 1
//         }
//       ],
//       razorpayPaymentId: "pay_1234567890"
//     },
//     {
//       _id: "2",
//       orderNumber: "ORD-1234567891-CD34",
//       customerName: "John Doe",
//       customerEmail: "john@example.com",
//       totalPrice: 799,
//       currency: "INR",
//       status: "paid",
//       orderDate: "2024-01-20T15:45:00Z",
//       cancellationDeadline: "2024-01-21T15:45:00Z",
//       address: {
//         name: "Office",
//         address: "456 Business Avenue, Suite 200",
//         city: "Delhi",
//         state: "Delhi",
//         zip: "110001"
//       },
//       products: [
//         {
//           product: {
//             _id: "prod3",
//             name: "Tulsi Mala Handcrafted",
//             price: 799,
//             slug: { current: "tulsi-mala-handcrafted" }
//           },
//           quantity: 1
//         }
//       ],
//       razorpayPaymentId: "pay_1234567891"
//     }
//   ];

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setLoading(true);
//       try {
//         setTimeout(() => {
//           setOrders(mockOrders);
//           setLoading(false);
//         }, 1000);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         setLoading(false);
//       }
//     };

//     if (user) {
//       fetchOrders();
//     }
//   }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        
        // Real implementation would be:
        const response = await fetch('/api/order');
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'paid': return <CreditCard className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'refund_requested': return <RotateCcw className="h-4 w-4" />;
      case 'refunded': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refund_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCancelOrder = (order: Order) => {
    const cancellableStatuses = ['pending', 'processing', 'paid'];
    const now = new Date();
    const deadline = order.cancellationDeadline ? new Date(order.cancellationDeadline) : null;
    
    return cancellableStatuses.includes(order.status) && 
           (!deadline || now <= deadline);
  };

  const canReturnOrder = (order: Order) => {
    return order.status === 'delivered';
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setActionLoading('cancel');
    try {
      const response = await fetch(`/api/order/${selectedOrder._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancellationReason })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Order cancelled successfully");
        setOrders(prev => prev.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: 'cancelled' }
            : order
        ));
        setCancelDialogOpen(false);
        setCancellationReason("");
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Error cancelling order");
    } finally {
      setActionLoading(null);
      setSelectedOrder(null);
    }
  };

  const handleReturnOrder = async () => {
    if (!selectedOrder || !returnReason) {
      toast.error("Please select a return reason");
      return;
    }

    setActionLoading('return');
    try {
      const response = await fetch(`/api/order/${selectedOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: returnReason,
          description: returnDescription 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Return request submitted successfully");
        setOrders(prev => prev.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: 'refund_requested' }
            : order
        ));
        setReturnDialogOpen(false);
        setReturnReason("");
        setReturnDescription("");
      } else {
        toast.error(data.error || "Failed to submit return request");
      }
    } catch (error) {
      toast.error("Error submitting return request");
    } finally {
      setActionLoading(null);
      setSelectedOrder(null);
    }
  };

  const handleDownloadReceipt = async (orderId: string) => {
    setActionLoading('receipt');
    try {
      const response = await fetch(`/api/order/${orderId}/receipt`);
      
      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Receipt downloaded successfully");
    } catch (error) {
      toast.error("Error downloading receipt");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrackOrder = async (order: Order) => {
    setSelectedOrder(order);
    setActionLoading('track');
    
    try {
      // Mock tracking data - replace with actual Shiprocket API call
      const mockTrackingData = {
        awb: order.awbCode,
        courier: order.courierName,
        status: order.status,
        trackingHistory: [
          { status: "Order Placed", date: order.orderDate, location: "Online" },
          { status: "Picked Up", date: "2024-01-16T10:00:00Z", location: "Mumbai Hub" },
          { status: "In Transit", date: "2024-01-17T14:30:00Z", location: "Delhi Hub" },
          { status: "Delivered", date: "2024-01-18T16:45:00Z", location: "Customer Address" }
        ]
      };
      
      setTrackingInfo(mockTrackingData);
      setTrackingDialogOpen(true);
    } catch (error) {
      toast.error("Error fetching tracking information");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button 
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-full"
              onClick={() => window.location.href = '/'}
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.orderDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {formatPrice(order.totalPrice, order.currency)}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(order.status)}`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                    </div>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Products ({order.products.length})
                    </h3>
                    <div className="space-y-3">
                      {order.products.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Link 
                              href={`/product/${item.product.slug?.current}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {item.product.name}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="font-medium text-gray-900">{order.address.name}</p>
                      <p className="text-gray-700 mt-1">{order.address.address}</p>
                      <p className="text-gray-700">
                        {order.address.city}, {order.address.state} {order.address.zip}
                      </p>
                    </div>

                    {order.awbCode && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Tracking Information</h4>
                        <p className="text-sm text-gray-600">
                          AWB: <span className="font-mono">{order.awbCode}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Courier: {order.courierName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      Total: {formatPrice(order.totalPrice, order.currency)}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {/* Download Receipt */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReceipt(order._id)}
                      disabled={actionLoading === 'receipt'}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>

                    {/* Track Order */}
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTrackOrder(order)}
                        disabled={actionLoading === 'track'}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Track Order
                      </Button>
                    )}

                    {/* Cancel Order */}
                    {canCancelOrder(order) && (
                      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cancel Order</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Are you sure you want to cancel order #{selectedOrder?.orderNumber}?
                            </p>
                            <Textarea
                              placeholder="Please provide a reason for cancellation..."
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                              className="min-h-20"
                            />
                            <div className="flex gap-3 justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setCancelDialogOpen(false)}
                              >
                                Keep Order
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={handleCancelOrder}
                                disabled={actionLoading === 'cancel' || !cancellationReason.trim()}
                              >
                                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Order'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Return Order */}
                    {canReturnOrder(order) && (
                      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Return Order</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Request a return for order #{selectedOrder?.orderNumber}
                            </p>
                            <div>
                              <label className="text-sm font-medium">Return Reason</label>
                              <Select value={returnReason} onValueChange={setReturnReason}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="damaged">Damaged Item</SelectItem>
                                  <SelectItem value="wrong_item">Wrong Item</SelectItem>
                                  <SelectItem value="size_issue">Size Issue</SelectItem>
                                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                                  <SelectItem value="not_described">Not as Described</SelectItem>
                                  <SelectItem value="changed_mind">Changed Mind</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea
                              placeholder="Additional details about the return..."
                              value={returnDescription}
                              onChange={(e) => setReturnDescription(e.target.value)}
                              className="min-h-20"
                            />
                            <div className="flex gap-3 justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setReturnDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleReturnOrder}
                                disabled={actionLoading === 'return' || !returnReason}
                              >
                                {actionLoading === 'return' ? 'Submitting...' : 'Submit Return'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Reorder */}
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Tracking</DialogTitle>
            </DialogHeader>
            {trackingInfo && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">AWB: {trackingInfo.awb}</p>
                    <p className="text-sm text-gray-600">Courier: {trackingInfo.courier}</p>
                  </div>
                  <Badge className={getStatusColor(trackingInfo.status)}>
                    {trackingInfo.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Tracking History</h3>
                  {trackingInfo.trackingHistory.map((event: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 border-l-2 border-blue-200 ml-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full -ml-4"></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedOrder?.trackingUrl && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(selectedOrder.trackingUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Courier Website
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrdersPage;