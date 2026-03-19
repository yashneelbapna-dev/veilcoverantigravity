import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Settings, Home, 
  ArrowRight, Download, MessageSquare, ShoppingBag, CreditCard,
  ChevronDown, ChevronUp, Loader2, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  created_at: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  model: string;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  order_status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

const statusSteps = [
  { key: "ordered", label: "Ordered", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "packed", label: "Packed", icon: Settings },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // If no orderId in URL, show search form
  const showSearchForm = !orderId;

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
      fetchTrackingHistory();
      setupRealtimeSubscription();
    } else if (orderId && !authLoading && !user) {
      setError("Please sign in to track your order");
      setLoading(false);
    } else if (!orderId) {
      setLoading(false);
    }
  }, [orderId, user, authLoading]);

  const fetchOrder = async () => {
    if (!orderId || !user) return;
    
    try {
      // Try to find by order ID or order number
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (!data) {
        setError("Order not found. Please check your order number.");
        return;
      }

      setOrder({
        ...data,
        items: data.items as unknown as OrderItem[],
        shipping_address: data.shipping_address as unknown as ShippingAddress,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingHistory = async () => {
    if (!orderId) return;
    
    try {
      // First get the actual order ID if we have an order number
      let actualOrderId = orderId;
      
      const { data: orderData } = await supabase
        .from("orders")
        .select("id")
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .maybeSingle();
      
      if (orderData) {
        actualOrderId = orderData.id;
      }

      const { data } = await supabase
        .from("order_tracking_history")
        .select("*")
        .eq("order_id", actualOrderId)
        .order("created_at", { ascending: false });

      if (data) setTrackingHistory(data);
    } catch (err) {
      console.error("Failed to fetch tracking history", err);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`live-tracking-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_tracking_history",
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          setTrackingHistory((prev) => [payload.new as TrackingEvent, ...prev]);
          // Update order status
          setOrder((prev) => prev ? { ...prev, order_status: (payload.new as TrackingEvent).status } : null);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => prev ? { 
            ...prev, 
            ...payload.new,
            items: payload.new.items as OrderItem[],
            shipping_address: payload.new.shipping_address as ShippingAddress,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery.trim()}`);
    }
  };

  const getStatusIndex = (status: string) => {
    const statusMap: Record<string, number> = {
      ordered: 0,
      pending: 0,
      confirmed: 1,
      packed: 2,
      processing: 2,
      shipped: 3,
      out_for_delivery: 4,
      delivered: 5,
      cancelled: -1,
    };
    return statusMap[status] ?? 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstimatedDelivery = () => {
    if (order?.estimated_delivery) {
      return formatDate(order.estimated_delivery);
    }
    if (order?.order_status === "delivered" && order?.delivered_at) {
      return `Delivered on ${formatDate(order.delivered_at)}`;
    }
    // Default estimate: 3-5 days from order
    const orderDate = new Date(order?.created_at || Date.now());
    orderDate.setDate(orderDate.getDate() + 5);
    return formatDate(orderDate.toISOString());
  };

  // Search form when no order ID
  if (showSearchForm) {
    return (
      <Layout>
        <div className="container-veil py-16 min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md w-full glass-card rounded-2xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground mb-6">
              Enter your order number to see real-time tracking updates
            </p>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter order number (e.g., VEIL-XXXXX)"
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12">
                Track Order
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              You can find your order number in your confirmation email or{" "}
              <Link to="/account" className="text-primary hover:underline">
                account orders
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container-veil py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container-veil py-16 min-h-[60vh] flex items-center justify-center">
          <div className="max-w-md w-full glass-card rounded-2xl border border-border/50 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <Package className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "We couldn't find this order."}</p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/track">Try Another Order</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/account">View My Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentIndex = getStatusIndex(order.order_status);
  const isCancelled = order.order_status === "cancelled";
  const progressPercentage = isCancelled ? 0 : (currentIndex / (statusSteps.length - 1)) * 100;

  return (
    <Layout>
      <main className="container-veil py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Status & Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Celebratory Header */}
            <div className="flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  isCancelled ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                )}>
                  {isCancelled ? <Package className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </div>
                <h1 className={cn(
                  "text-3xl lg:text-4xl font-black leading-tight tracking-tight",
                  isCancelled ? "text-destructive" : "text-primary"
                )}>
                  {isCancelled ? "Order Cancelled" : order.order_status === "delivered" ? "Delivered!" : "Thank You!"}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg pl-[52px]">
                Your order <span className="text-foreground font-mono font-medium">{order.order_number}</span> is{" "}
                {isCancelled ? "cancelled" : order.order_status.replace(/_/g, " ")}.
              </p>
            </div>

            {/* Delivery Estimate */}
            {!isCancelled && (
              <div className="glass-card p-6 rounded-xl border-l-4 border-primary">
                <h2 className="text-primary text-2xl lg:text-3xl font-bold leading-tight mb-1">
                  {order.order_status === "delivered" ? "Delivered" : "Estimated Delivery"}
                </h2>
                <p className="text-foreground text-xl">{getEstimatedDelivery()}</p>
              </div>
            )}

            {/* Progress Tracker */}
            {!isCancelled && (
              <div className="glass-card p-6 lg:p-8 rounded-xl">
                <div className="relative">
                  {/* Progress Line Background */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-muted rounded-full mx-4" />
                  {/* Active Progress Line */}
                  <div 
                    className="absolute top-4 left-0 h-1 bg-primary rounded-full mx-4 transition-all duration-500 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                    style={{ width: `calc(${progressPercentage}% - 2rem)` }}
                  />
                  
                  {/* Steps */}
                  <div className="relative z-10 flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex flex-col items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            isCompleted
                              ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                              : "bg-muted border-2 border-muted-foreground/30 text-muted-foreground",
                            isCurrent && "ring-4 ring-primary/20"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className={cn(
                            "text-xs font-medium uppercase tracking-wider hidden sm:block",
                            isCompleted ? (isCurrent ? "text-primary font-bold" : "text-foreground") : "text-muted-foreground"
                          )}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Labels */}
                <div className="flex justify-between mt-2 sm:hidden">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                      <p key={step.key} className={cn(
                        "text-[10px] font-medium uppercase",
                        isCompleted ? (isCurrent ? "text-primary font-bold" : "text-foreground") : "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Summary Card */}
            <div className="glass-card p-6 rounded-xl flex flex-col gap-6">
              <h3 className="text-foreground text-lg font-bold border-b border-border/50 pb-3">Order Summary</h3>
              
              {/* Products */}
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <Link
                    key={index}
                    to={`/product/${item.productId}`}
                    className="flex gap-4 items-start hover:bg-muted/30 -m-2 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                      <img
                        alt={item.name}
                        src={item.image}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center min-h-[5rem]">
                      <h4 className="text-foreground font-medium text-base">{item.name}</h4>
                      <p className="text-muted-foreground text-sm">{item.color} • Qty: {item.quantity}</p>
                      <p className="text-primary font-bold mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Address & Payment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-2">
                    Shipping Address
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <span className="text-foreground font-medium block mb-1">{order.shipping_address.fullName}</span>
                    {order.shipping_address.address}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}<br />
                    {order.shipping_address.country}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-2">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="capitalize">
                      {order.payment_method === "phonepe" ? "PhonePe UPI" : order.payment_method || "N/A"}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold mb-1">Total Paid</p>
                    <p className="text-foreground font-bold text-lg">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            {trackingHistory.length > 0 && (
              <div className="glass-card p-6 rounded-xl">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between text-foreground font-medium"
                >
                  <span>Tracking History ({trackingHistory.length})</span>
                  {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                {showHistory && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/30">
                    {trackingHistory.map((event) => (
                      <div key={event.id} className="relative pl-4">
                        <div className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-primary" />
                        <p className="text-sm font-medium text-foreground capitalize">
                          {event.status.replace(/_/g, " ")}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button asChild className="flex-1 min-w-[200px] h-12">
                <Link to="/shop">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 min-w-[200px] h-12 glass-button">
                <MessageSquare className="mr-2 h-4 w-4" />
                Track on WhatsApp
              </Button>
              <Button variant="ghost" className="h-12 px-6 text-muted-foreground hover:text-foreground">
                <Download className="mr-2 h-4 w-4" />
                Invoice
              </Button>
            </div>
          </div>

          {/* Right Column: Live Map Placeholder */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="sticky top-24 min-h-[500px] lg:h-[calc(100vh-140px)] rounded-2xl overflow-hidden relative border border-border/50 shadow-2xl bg-muted/30">
              {/* Map Placeholder Background */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')`,
                  filter: 'grayscale(100%) contrast(120%) brightness(60%)'
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              
              {/* Pulsing Location Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 animate-ping absolute" />
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.8)] border-2 border-background relative z-10" />
                <div className="mt-2 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 text-xs text-primary font-bold shadow-lg">
                  {order.order_status === "shipped" || order.order_status === "out_for_delivery" 
                    ? "Courier is here" 
                    : order.order_status === "delivered" 
                      ? "Delivered" 
                      : "Processing"}
                </div>
              </div>

              {/* Destination Marker */}
              <div className="absolute top-[30%] left-[60%] flex flex-col items-center">
                <MapPin className="h-8 w-8 text-foreground drop-shadow-md" />
              </div>

              {/* Delivery Partner Card */}
              <div className="absolute bottom-6 left-6 right-6 glass-card p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-bold text-sm">Delivery Partner</p>
                    <p className="text-muted-foreground text-xs truncate">
                      {order.carrier || "Express Delivery"} • {order.tracking_number || "Tracking soon"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-primary font-bold text-sm">
                      {order.shipping_address.city}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      Last update: {trackingHistory[0] ? formatDateTime(trackingHistory[0].created_at) : "Just now"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full border border-border/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span className="text-xs font-medium text-foreground">Live</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default TrackOrder;
