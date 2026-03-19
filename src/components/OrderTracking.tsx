import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  created_at: string;
}

interface OrderTrackingProps {
  orderId?: string;
  orderStatus: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingHistory?: TrackingEvent[];
}

const statusSteps = [
  { key: "ordered", label: "Ordered", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export function OrderTracking({
  orderId,
  orderStatus,
  trackingNumber,
  carrier,
  estimatedDelivery,
  shippedAt,
  deliveredAt,
  trackingHistory: initialHistory = [],
}: OrderTrackingProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<TrackingEvent[]>(initialHistory);
  const [currentStatus, setCurrentStatus] = useState(orderStatus);

  // Realtime subscription for order status updates
  useEffect(() => {
    if (!orderId) return;

    // Fetch initial tracking history
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("order_tracking_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });
      
      if (data) setTrackingHistory(data);
    };

    fetchHistory();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_tracking_history",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setTrackingHistory((prev) => [payload.new as TrackingEvent, ...prev]);
          setCurrentStatus((payload.new as TrackingEvent).status);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.order_status) {
            setCurrentStatus(payload.new.order_status as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Update current status from prop changes
  useEffect(() => {
    setCurrentStatus(orderStatus);
  }, [orderStatus]);

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

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isCancelled) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
        <p className="text-destructive font-medium">Order Cancelled</p>
        <p className="text-sm text-muted-foreground mt-1">
          This order has been cancelled. If you have questions, please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Tracker */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted mx-6 sm:mx-8">
          <div
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all z-10",
                    isCompleted
                      ? "bg-success border-success text-success-foreground"
                      : "bg-background border-muted text-muted-foreground",
                    isCurrent && "ring-2 sm:ring-4 ring-success/20"
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span
                  className={cn(
                    "mt-1 text-[10px] sm:text-xs font-medium text-center",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Info */}
      {(trackingNumber || carrier || estimatedDelivery) && (
        <div className="grid gap-3 sm:grid-cols-3 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50 text-sm">
          {trackingNumber && (
            <div>
              <p className="text-xs text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-medium text-foreground">{trackingNumber}</p>
            </div>
          )}
          {carrier && (
            <div>
              <p className="text-xs text-muted-foreground">Carrier</p>
              <p className="font-medium text-foreground uppercase">{carrier}</p>
            </div>
          )}
          {estimatedDelivery && (
            <div>
              <p className="text-xs text-muted-foreground">Est. Delivery</p>
              <p className="font-medium text-foreground">{formatDate(estimatedDelivery)}</p>
            </div>
          )}
        </div>
      )}

      {/* Delivery Dates */}
      <div className="flex flex-wrap gap-3 text-sm">
        {shippedAt && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Shipped: {formatDateTime(shippedAt)}</span>
          </div>
        )}
        {deliveredAt && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-4 w-4" />
            <span>Delivered: {formatDateTime(deliveredAt)}</span>
          </div>
        )}
      </div>

      {/* Tracking History */}
      {trackingHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHistory ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide History
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View History ({trackingHistory.length})
              </>
            )}
          </button>

          {showHistory && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-muted">
              {trackingHistory.map((event) => (
                <div key={event.id} className="relative pl-4">
                  <div className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-muted-foreground" />
                  <p className="text-sm font-medium text-foreground capitalize">{event.status.replace(/_/g, " ")}</p>
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

      {/* Realtime Indicator */}
      {orderId && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          Live updates
        </div>
      )}
    </div>
  );
}
