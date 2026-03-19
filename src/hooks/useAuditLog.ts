import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AuditAction = 
  | "view_customer_data"
  | "view_user_files"
  | "update_order_status"
  | "send_status_email"
  | "create_product"
  | "update_product"
  | "delete_product"
  | "export_orders"
  | "export_inventory"
  | "view_audit_logs";

export type AuditResourceType = 
  | "customer"
  | "order"
  | "product"
  | "user_storage"
  | "export"
  | "audit_log";

interface AuditDetails {
  [key: string]: unknown;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: AuditAction,
    resourceType: AuditResourceType,
    resourceId?: string,
    details?: AuditDetails
  ) => {
    if (!user) {
      console.warn("Cannot log audit action: no user authenticated");
      return;
    }

    try {
      const { error } = await supabase.from("audit_logs").insert([{
        admin_user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: JSON.parse(JSON.stringify(details || {})),
        user_agent: navigator.userAgent,
      }]);

      if (error) {
        console.error("Failed to log audit action:", error);
      }
    } catch (err) {
      console.error("Audit logging exception:", err);
    }
  }, [user]);

  return { logAction };
};
