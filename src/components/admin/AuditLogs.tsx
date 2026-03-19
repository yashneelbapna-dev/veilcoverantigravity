import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  User,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useAuditLog } from "@/hooks/useAuditLog";

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: unknown;
  user_agent: string | null;
  created_at: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  view_customer_data: <Eye className="h-4 w-4" />,
  view_user_files: <FileText className="h-4 w-4" />,
  update_order_status: <Edit className="h-4 w-4" />,
  send_status_email: <Mail className="h-4 w-4" />,
  create_product: <Edit className="h-4 w-4" />,
  update_product: <Edit className="h-4 w-4" />,
  delete_product: <Trash2 className="h-4 w-4" />,
  export_orders: <Download className="h-4 w-4" />,
  export_inventory: <Download className="h-4 w-4" />,
  view_audit_logs: <Shield className="h-4 w-4" />,
};

const ACTION_LABELS: Record<string, string> = {
  view_customer_data: "Viewed Customer Data",
  view_user_files: "Viewed User Files",
  update_order_status: "Updated Order Status",
  send_status_email: "Sent Status Email",
  create_product: "Created Product",
  update_product: "Updated Product",
  delete_product: "Deleted Product",
  export_orders: "Exported Orders",
  export_inventory: "Exported Inventory",
  view_audit_logs: "Viewed Audit Logs",
};

const getActionBadgeClass = (action: string) => {
  if (action.includes('delete')) return 'admin-badge admin-badge-destructive';
  if (action.includes('view') || action.includes('export')) return 'admin-badge admin-badge-neutral';
  return 'admin-badge admin-badge-gold';
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { logAction } = useAuditLog();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (actionFilter !== "all") query = query.eq("action", actionFilter);
      const { data, error } = await query;
      if (error) { console.error("Error fetching audit logs:", error); return; }
      setLogs(data || []);
      await logAction("view_audit_logs", "audit_log", undefined, { count: data?.length || 0 });
    } catch (err) {
      console.error("Audit logs fetch error:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return log.action.toLowerCase().includes(search) || log.resource_type.toLowerCase().includes(search) || log.resource_id?.toLowerCase().includes(search) || JSON.stringify(log.details).toLowerCase().includes(search);
  });

  const formatTimestamp = (timestamp: string) => format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");

  return (
    <>
      <div className="admin-glass-panel overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[hsl(45,76%,52%)]" />
            <h3 className="text-lg font-bold">Audit Trail</h3>
            <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
              {filteredLogs.length} entries
            </span>
          </div>
          <button onClick={fetchLogs} disabled={loading} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:border-[hsl(45,76%,52%,0.3)] hover:text-[hsl(45,76%,52%)] transition-all flex items-center gap-2 disabled:opacity-50">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="p-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10 text-white/60 rounded-xl">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(0,0%,8%)] border-white/10">
                <SelectItem value="all" className="text-white/80 focus:text-white focus:bg-white/10">All Actions</SelectItem>
                <SelectItem value="view_customer_data" className="text-white/80 focus:text-white focus:bg-white/10">View Customer Data</SelectItem>
                <SelectItem value="update_order_status" className="text-white/80 focus:text-white focus:bg-white/10">Update Order Status</SelectItem>
                <SelectItem value="send_status_email" className="text-white/80 focus:text-white focus:bg-white/10">Send Status Email</SelectItem>
                <SelectItem value="create_product" className="text-white/80 focus:text-white focus:bg-white/10">Create Product</SelectItem>
                <SelectItem value="update_product" className="text-white/80 focus:text-white focus:bg-white/10">Update Product</SelectItem>
                <SelectItem value="delete_product" className="text-white/80 focus:text-white focus:bg-white/10">Delete Product</SelectItem>
                <SelectItem value="export_orders" className="text-white/80 focus:text-white focus:bg-white/10">Export Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(45,76%,52%)]"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">No audit logs found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="w-full text-left p-4 rounded-xl border border-white/5 hover:border-[hsl(45,76%,52%,0.2)] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white/5 shrink-0 text-white/40">
                        {ACTION_ICONS[log.action] || <Shield className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={getActionBadgeClass(log.action)}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                          <span className="text-[10px] text-white/30 uppercase tracking-widest">{log.resource_type}</span>
                        </div>
                        <p className="text-sm mt-1 truncate">
                          {log.resource_id ? (
                            <span className="font-mono text-xs text-white/40">{log.resource_id}</span>
                          ) : (
                            <span className="text-white/20">No resource ID</span>
                          )}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">{formatTimestamp(log.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg bg-[hsl(0,0%,6%)] border-[hsl(45,76%,52%,0.15)] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[hsl(45,76%,52%)]" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {selectedLog && formatTimestamp(selectedLog.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Action</p>
                  <span className={getActionBadgeClass(selectedLog.action)}>
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Resource Type</p>
                  <p className="text-sm capitalize">{selectedLog.resource_type}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Resource ID</p>
                <p className="text-sm font-mono text-white/60">{selectedLog.resource_id || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Admin User ID</p>
                <p className="text-sm font-mono truncate text-white/60">{selectedLog.admin_user_id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Details</p>
                <pre className="text-xs bg-white/[0.03] p-3 rounded-lg overflow-x-auto max-h-[200px] text-white/60 border border-white/5">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
