import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateFullName } from "@/lib/validation";
import { maskEmail, maskPhone } from "@/lib/masking";


import { products, Product } from "@/data/collections";
import { products as veilProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import AddressBook from "@/components/AddressBook";
import { OrderTracking } from "@/components/OrderTracking";
import { User, Package, LogOut, Edit2, Save, ChevronDown, ChevronUp, MapPin, CreditCard, Receipt, ShoppingBag, Bell, MessageSquare, Loader2, Truck, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
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

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  created_at: string;
}

const Account = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  

  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const CANCELLABLE_STATUSES = ['pending', 'ordered', 'confirmed', 'packed'];

  // Don't redirect - allow guest users to view settings/wishlist
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Real-time subscription for order status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setOrders(prev => prev.map(order => 
            order.id === updated.id 
              ? { ...order, order_status: updated.order_status, payment_status: updated.payment_status, tracking_number: updated.tracking_number, carrier: updated.carrier, estimated_delivery: updated.estimated_delivery, shipped_at: updated.shipped_at, delivered_at: updated.delivered_at, updated_at: updated.updated_at }
              : order
          ));
          toast({
            title: "Order Updated",
            description: `Order ${updated.order_number} status: ${updated.order_status.replace(/_/g, ' ')}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name,
          email: data.email || user.email,
          phone: data.phone,
          created_at: data.created_at,
        });
        setEditForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
        // Load notification preferences
        setEmailNotifications((data as any).notify_email ?? true);
        setWhatsappNotifications((data as any).notify_whatsapp ?? false);
      } else {
        const metadata = user.user_metadata;
        setProfile({
          full_name: metadata?.full_name || metadata?.name || null,
          email: user.email || null,
          phone: metadata?.phone || null,
          created_at: user.created_at,
        });
        setEditForm({
          full_name: metadata?.full_name || metadata?.name || "",
          phone: metadata?.phone || "",
        });
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      setOrders((data || []).map((order: any) => ({
        ...order,
        items: order.items as OrderItem[],
        shipping_address: order.shipping_address as ShippingAddress,
      })));
    } catch (error) {
      // Silent error
    }
  };

  const handleNameChange = (value: string) => {
    setEditForm({ ...editForm, full_name: value });
    const validation = validateFullName(value);
    setNameError(validation.success ? null : validation.error);
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setEditForm({ ...editForm, phone: digits });
    if (digits.length > 0 && digits.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
    } else {
      setPhoneError(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const validation = validateFullName(editForm.full_name);
    if (!validation.success) {
      setNameError(validation.error);
      return;
    }

    const phoneDigits = editForm.phone.replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }

    setSaving(true);
    try {
      // Try update first
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let error;
      if (existing) {
        const result = await supabase
          .from("profiles")
          .update({
            full_name: editForm.full_name.trim(),
            phone: phoneDigits || null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            full_name: editForm.full_name.trim(),
            phone: phoneDigits || null,
            email: user.email,
          });
        error = result.error;
      }

      if (error) throw error;

      setProfile((prev) => prev ? {
        ...prev,
        full_name: editForm.full_name.trim(),
        phone: phoneDigits || null,
      } : null);
      setEditing(false);
      setNameError(null);
      setPhoneError(null);
      toast({ title: "Profile updated successfully!", description: "Your profile has been saved." });
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast({ title: "Error", description: error.message || "Failed to update profile. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancelConfirmId(null);
    setCancellingOrderId(orderId);
    try {
      const { error } = await supabase.rpc('cancel_user_order', { order_id: orderId });
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: 'cancelled' } : o));
      toast({ title: "Order cancelled", description: "Your order has been cancelled successfully." });
    } catch (error: any) {
      toast({ title: "Cannot cancel order", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container-veil py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Guest";
  const isGuest = !user;

  // Login prompt component for guest users
  const LoginPrompt = ({ message }: { message: string }) => (
    <div className="glass-card rounded-xl border border-border/50 p-8 text-center">
      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Sign in Required</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button asChild>
        <Link to="/auth">Sign In</Link>
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container-veil py-12">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isGuest ? "Account" : `Welcome, ${displayName}!`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isGuest ? "Sign in to manage your account" : "Manage your account and view your orders"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card border border-border/50 flex-wrap h-auto p-1">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {isGuest ? (
              <LoginPrompt message="Sign in to view and edit your profile information." />
            ) : (
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                  {!editing ? (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="glass-button">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleSaveProfile} disabled={!!nameError || !!phoneError || saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    {editing ? (
                      <div>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className={`mt-1 ${nameError ? 'border-destructive' : ''}`}
                          placeholder="Enter your full name (letters only)"
                        />
                        {nameError && <p className="text-sm text-destructive mt-1">{nameError}</p>}
                      </div>
                    ) : (
                      <p className="font-medium text-foreground">{profile?.full_name || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium text-foreground">{maskEmail(profile?.email || user?.email)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    {editing ? (
                      <div>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                              e.preventDefault();
                            }
                          }}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          className={`mt-1 ${phoneError ? 'border-destructive' : ''}`}
                          placeholder="10-digit mobile number"
                        />
                        {phoneError && <p className="text-sm text-[hsl(0,84%,60%)] mt-1">{phoneError}</p>}
                      </div>
                    ) : (
                      <p className="font-medium text-foreground">{profile?.phone ? maskPhone(profile.phone) : "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Member Since</label>
                    <p className="font-medium text-foreground">
                      {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {isGuest ? (
              <LoginPrompt message="Sign in to view your order history." />
            ) : (
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild>
                      <Link to="/shop">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-lg border border-border/50 overflow-hidden glass-card">
                        {/* Order Header - Clickable */}
                        <div className="flex items-center justify-between p-4">
                          <button
                            onClick={() => toggleOrderExpand(order.id)}
                            className="flex-1 text-left hover:bg-muted/30 -m-2 p-2 rounded-lg transition-colors"
                          >
                            <p className="font-medium text-foreground">
                              {order.items.length > 0 
                                ? order.items.map((item: OrderItem) => item.name).join(', ')
                                : order.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{order.order_number} • {formatDate(order.created_at)}</p>
                          </button>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-foreground">{formatPrice(order.total)}</p>
                              <span className={`text-xs px-2 py-1 rounded capitalize ${
                                order.order_status === 'delivered' ? 'bg-success/20 text-success' :
                                order.order_status === 'shipped' ? 'bg-primary/20 text-primary' :
                                order.order_status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {order.order_status === 'pending' ? 'ordered' : order.order_status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <button onClick={() => toggleOrderExpand(order.id)}>
                              {expandedOrder === order.id ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded Order Details */}
                        {expandedOrder === order.id && (
                          <div className="border-t border-border/50 p-4 space-y-6 bg-muted/10">
                            {/* Order Tracking */}
                            <div className="flex items-start gap-3">
                              <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-foreground mb-3">Order Tracking</p>
                                <OrderTracking
                                  orderId={order.id}
                                  orderStatus={order.order_status}
                                  trackingNumber={order.tracking_number}
                                  carrier={order.carrier}
                                  estimatedDelivery={order.estimated_delivery}
                                  shippedAt={order.shipped_at}
                                  deliveredAt={order.delivered_at}
                                />
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium text-foreground">Shipping Address</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.shipping_address.fullName}<br />
                                  {order.shipping_address.address}<br />
                                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}<br />
                                  {order.shipping_address.country}<br />
                                  Phone: {order.shipping_address.phone}
                                </p>
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div className="flex items-start gap-3">
                              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium text-foreground">Payment Method</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {order.payment_method === "card" ? "Credit/Debit Card" : order.payment_method?.toUpperCase() || "N/A"}
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${order.payment_status === 'completed' ? 'bg-success/20 text-success' : 'bg-amber-500/20 text-amber-600'}`}>
                                    {order.payment_status}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Bill Summary */}
                            <div className="flex items-start gap-3">
                              <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-foreground mb-2">Bill Summary</p>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Tax (GST)</span>
                                    <span>{formatPrice(order.tax)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border/50">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Products */}
                            <div className="flex items-start gap-3">
                              <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-foreground mb-2">Products ({order.items.length})</p>
                                <div className="space-y-3">
                                  {order.items.map((item, index) => {
                                     const veilProduct = veilProducts.find(p => p.id === item.productId) || veilProducts.find(p => p.name === item.name);
                                     const productLink = veilProduct ? `/product/${veilProduct.slug}` : `/shop`;
                                    return (
                                    <Link
                                      key={index}
                                      to={productLink}
                                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-14 h-14 object-cover rounded"
                                      />
                                      <div className="flex-1">
                                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {item.color} • {item.model} • Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-medium text-foreground text-sm">
                                        {formatPrice(item.price * item.quantity)}
                                      </p>
                                    </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Cancel Order Button */}
                            {CANCELLABLE_STATUSES.includes(order.order_status) && (
                              <div className="pt-2 border-t border-border/50">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setCancelConfirmId(order.id)}
                                  disabled={cancellingOrderId === order.id}
                                  className="gap-2"
                                >
                                  {cancellingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Address Book Tab */}
          <TabsContent value="addresses">
            {isGuest ? (
              <LoginPrompt message="Sign in to manage your saved addresses." />
            ) : (
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <AddressBook />
              </div>
            )}
          </TabsContent>


          {/* Notifications Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">

              {/* Notifications */}
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Order updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={async (val) => {
                        setEmailNotifications(val);
                        if (!user) return;
                        setSavingPrefs(true);
                        await supabase.from("profiles").update({ notify_email: val } as any).eq("user_id", user.id);
                        setSavingPrefs(false);
                        toast({ title: val ? "Email notifications enabled" : "Email notifications disabled" });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">WhatsApp Updates</p>
                        <p className="text-sm text-muted-foreground">Order & shipping updates via WhatsApp</p>
                      </div>
                    </div>
                    <Switch
                      checked={whatsappNotifications}
                      onCheckedChange={async (val) => {
                        setWhatsappNotifications(val);
                        if (!user) return;
                        setSavingPrefs(true);
                        await supabase.from("profiles").update({ notify_whatsapp: val } as any).eq("user_id", user.id);
                        setSavingPrefs(false);
                        toast({ title: val ? "WhatsApp updates enabled" : "WhatsApp updates disabled" });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="glass-card rounded-xl border border-border/50 p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Account Actions</h2>
                
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <QuickViewModal 
        product={quickViewProduct} 
        open={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={!!cancelConfirmId} onOpenChange={(open) => !open && setCancelConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelConfirmId && handleCancelOrder(cancelConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Account;
