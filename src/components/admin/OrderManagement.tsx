import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Package, Truck, Edit2, Send, Loader2, MessageCircle } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
  transaction_id: string | null;
  created_at: string;
  items: any;
  shipping_address: any;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  user_id: string;
}

interface OrderManagementProps {
  orders: Order[];
  onOrderUpdate: () => void;
  formatPrice: (price: number) => string;
}

const ORDER_STATUSES = [
  { value: "ordered", label: "Ordered" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const CARRIERS = [
  { value: "delhivery", label: "Delhivery" },
  { value: "bluedart", label: "Blue Dart" },
  { value: "dtdc", label: "DTDC" },
  { value: "ecom_express", label: "Ecom Express" },
  { value: "xpressbees", label: "XpressBees" },
  { value: "india_post", label: "India Post" },
];

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'delivered': return 'admin-badge admin-badge-success';
    case 'shipped':
    case 'out_for_delivery': return 'admin-badge admin-badge-gold';
    case 'cancelled': return 'admin-badge admin-badge-destructive';
    default: return 'admin-badge admin-badge-neutral';
  }
};

export const OrderManagement = ({ orders, onOrderUpdate, formatPrice }: OrderManagementProps) => {
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const [formData, setFormData] = useState({
    order_status: "",
    tracking_number: "",
    carrier: "",
    estimated_delivery: "",
  });

  const openEditDialog = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      order_status: order.order_status,
      tracking_number: order.tracking_number || "",
      carrier: order.carrier || "",
      estimated_delivery: order.estimated_delivery || "",
    });
  };

  const sendStatusEmail = async (order: Order, status: string) => {
    setSendingEmail(true);
    try {
      const shippingAddress = order.shipping_address as any;
      let customerEmail = shippingAddress?.email;
      let customerName = shippingAddress?.fullName || shippingAddress?.name;

      if (!customerEmail || !customerEmail.includes('@')) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", order.user_id)
          .single();
        if (profileData?.email) customerEmail = profileData.email;
        if (profileData?.full_name && !customerName) customerName = profileData.full_name;
      }

      if (!customerEmail || !customerEmail.includes('@')) {
        throw new Error("Customer email not found. Cannot send notification.");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            order: {
              order_number: order.order_number,
              customer_name: customerName || "Customer",
              email: customerEmail,
              status: status,
              total: order.total,
              tracking_number: formData.tracking_number || order.tracking_number || null,
              carrier: formData.carrier || order.carrier || null,
              estimated_delivery: formData.estimated_delivery || order.estimated_delivery || null,
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Email send failed:", errData);
        throw new Error(errData.error || "Failed to send email");
      }

      await logAction("send_status_email", "order", order.id, {
        order_number: order.order_number,
        customer_email: customerEmail,
        status: status,
        method: "edge_function",
      });

      toast({ title: "Email sent!", description: `Status update sent to ${customerEmail}` });
    } catch (error: any) {
      console.error("Email send error:", error);
      toast({ title: "Email failed", description: error.message || "Could not send email notification", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;
    
    setUpdating(true);
    try {
      const updateData: Record<string, any> = {
        order_status: formData.order_status,
        tracking_number: formData.tracking_number || null,
        carrier: formData.carrier || null,
        estimated_delivery: formData.estimated_delivery || null,
      };

      if (formData.order_status === "shipped" && editingOrder.order_status !== "shipped") {
        updateData.shipped_at = new Date().toISOString();
      }
      
      if (formData.order_status === "delivered" && editingOrder.order_status !== "delivered") {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", editingOrder.id);

      if (error) throw error;

      await supabase.from("order_tracking_history").insert({
        order_id: editingOrder.id,
        status: formData.order_status,
        description: `Order status updated to ${formData.order_status}`,
        location: formData.carrier ? `Via ${formData.carrier.toUpperCase()}` : null,
      });

      await logAction("update_order_status", "order", editingOrder.id, {
        order_number: editingOrder.order_number,
        previous_status: editingOrder.order_status,
        new_status: formData.order_status,
        tracking_number: formData.tracking_number || null,
        carrier: formData.carrier || null,
      });

      // Auto-send email on status change via edge function
      if (formData.order_status !== editingOrder.order_status) {
        await sendStatusEmail(editingOrder, formData.order_status);
      }

      toast({ title: "Order updated!", description: `Order ${editingOrder.order_number} has been updated.` });
      setEditingOrder(null);
      onOrderUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update order", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="admin-glass-panel overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-[hsl(45,76%,52%)]" />
            <h3 className="text-lg font-bold">Order Management</h3>
            <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
              {orders.length} orders
            </span>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <p className="text-white/40 text-center py-12">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 30).map((order) => {
                  const address = order.shipping_address as any;
                  const displayStatus = order.order_status === 'pending' ? 'ordered' : order.order_status.replace(/_/g, ' ');
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-xs">{order.order_number}</td>
                      <td>
                        <div>
                          <p className="font-medium text-xs text-white">{address?.fullName}</p>
                          <p className="text-[10px] text-white/30">{address?.email}</p>
                        </div>
                      </td>
                      <td className="text-xs font-mono text-white/60">{(order as any).phone || address?.phone || '—'}</td>
                      <td className="font-bold text-sm admin-gold-text">{formatPrice(order.total)}</td>
                      <td>
                        <span className={getStatusBadgeClass(order.order_status)}>{displayStatus}</span>
                      </td>
                      <td className="text-xs">
                        {order.tracking_number ? (
                          <div>
                            <p className="font-mono text-white/60">{order.tracking_number}</p>
                            <p className="text-white/30 capitalize text-[10px]">{order.carrier}</p>
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => openEditDialog(order)}
                          className="size-9 rounded-lg flex items-center justify-center hover:bg-[hsl(45,76%,52%,0.1)] transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-white/30 hover:text-[hsl(45,76%,52%)]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="sm:max-w-md bg-[hsl(0,0%,6%)] border-[hsl(45,76%,52%,0.15)] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[hsl(45,76%,52%)]" />
              Update Order
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {editingOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white/60">Order Status</Label>
              <Select value={formData.order_status} onValueChange={(value) => setFormData({ ...formData, order_status: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,8%)] border-white/10">
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-white/80 focus:text-white focus:bg-white/10">{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60">Carrier</Label>
              <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select carrier" /></SelectTrigger>
                <SelectContent className="bg-[hsl(0,0%,8%)] border-white/10">
                  {CARRIERS.map((carrier) => (
                    <SelectItem key={carrier.value} value={carrier.value} className="text-white/80 focus:text-white focus:bg-white/10">{carrier.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60">Tracking Number</Label>
              <Input value={formData.tracking_number} onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })} placeholder="Enter tracking number" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60">Estimated Delivery</Label>
              <Input type="date" value={formData.estimated_delivery} onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              onClick={() => editingOrder && sendStatusEmail(editingOrder, formData.order_status)}
              disabled={sendingEmail}
              className="px-4 py-2 rounded-lg border border-[hsl(45,76%,52%,0.3)] text-[hsl(45,76%,52%)] text-xs font-bold uppercase tracking-widest hover:bg-[hsl(45,76%,52%,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Email
            </button>
            <button
              onClick={() => {
                if (!editingOrder) return;
                const address = editingOrder.shipping_address as any;
                let phone = address?.phone || address?.mobile || "";
                // Clean phone number - remove spaces, dashes, etc.
                phone = phone.replace(/[\s\-\(\)]/g, "");
                // Ensure it starts with country code
                if (phone.startsWith("0")) phone = "91" + phone.slice(1);
                if (!phone.startsWith("+") && !phone.startsWith("91")) phone = "91" + phone;
                phone = phone.replace("+", "");
                
                const statusLabel = ORDER_STATUSES.find(s => s.value === formData.order_status)?.label || formData.order_status;
                const trackingInfo = formData.tracking_number ? `\nTracking: ${formData.tracking_number}` : "";
                const carrierInfo = formData.carrier ? `\nCarrier: ${CARRIERS.find(c => c.value === formData.carrier)?.label || formData.carrier}` : "";
                const message = `Hi ${address?.fullName || "there"}! 👋\n\nYour VEIL order *${editingOrder.order_number}* status has been updated to: *${statusLabel}*${trackingInfo}${carrierInfo}\n\nThank you for shopping with VEIL! 🖤`;
                
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
              }}
              className="px-4 py-2 rounded-lg border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest hover:bg-green-500/10 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              onClick={handleUpdateOrder}
              disabled={updating}
              className="admin-gold-gradient-bg text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Order
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
