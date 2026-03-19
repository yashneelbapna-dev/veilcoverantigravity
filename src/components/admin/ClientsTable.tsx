import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, ChevronDown, ChevronUp, MessageCircle, Mail } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  notify_email: boolean;
  notify_whatsapp: boolean;
}

interface ClientData extends Profile {
  allPhones: string[];
}

export const ClientsTable = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch profiles
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (profileError) throw profileError;

        // Fetch all order phones grouped by user_id
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("user_id, phone, shipping_address");
        if (orderError) throw orderError;

        // Build phone map: user_id -> Set of unique phones
        const phoneMap: Record<string, Set<string>> = {};
        (orders || []).forEach((order: any) => {
          const uid = order.user_id;
          if (!phoneMap[uid]) phoneMap[uid] = new Set();
          // From dedicated phone column
          if (order.phone) phoneMap[uid].add(order.phone.replace(/\D/g, ""));
          // From shipping_address JSON
          const addr = order.shipping_address as any;
          if (addr?.phone) phoneMap[uid].add(String(addr.phone).replace(/\D/g, ""));
        });

        const clientData: ClientData[] = (profiles || []).map((p: any) => {
          const orderPhones = phoneMap[p.user_id] ? Array.from(phoneMap[p.user_id]) : [];
          if (p.phone) {
            const profileDigits = p.phone.replace(/\D/g, "");
            if (profileDigits && !orderPhones.includes(profileDigits)) {
              orderPhones.unshift(profileDigits);
            }
          }
          return { 
            ...p, 
            allPhones: orderPhones,
            notify_email: p.notify_email ?? true,
            notify_whatsapp: p.notify_whatsapp ?? false,
          };
        });

        setClients(clientData);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(45,76%,52%)]"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-12 text-center">
        <User className="h-10 w-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Phone Numbers</th>
            <th>Notifications</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const initials = (client.full_name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const isExpanded = expandedClient === client.id;
            const primaryPhone = client.allPhones[0] || client.phone || "—";
            const extraCount = client.allPhones.length > 1 ? client.allPhones.length - 1 : 0;

            return (
              <tr key={client.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-[hsl(45,76%,52%,0.1)] border border-[hsl(45,76%,52%,0.2)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[hsl(45,76%,52%)] text-xs font-bold">{initials}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {client.full_name || "Unnamed"}
                    </p>
                  </div>
                </td>
                <td>
                  <p className="text-xs text-white/60">{client.email || "—"}</p>
                </td>
                <td>
                  <div>
                    <p className="text-xs font-mono text-white/60">{primaryPhone}</p>
                    {extraCount > 0 && (
                      <button
                        onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                        className="text-[10px] text-[hsl(45,76%,52%)] hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        +{extraCount} more
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                    {isExpanded && client.allPhones.length > 1 && (
                      <div className="mt-1 space-y-0.5">
                        {client.allPhones.slice(1).map((phone, i) => (
                          <p key={i} className="text-[10px] font-mono text-white/40">{phone}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {client.notify_email && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                    {client.notify_whatsapp && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </span>
                    )}
                    {!client.notify_email && !client.notify_whatsapp && (
                      <span className="text-[10px] text-white/30">None</span>
                    )}
                  </div>
                </td>
                <td>
                  <p className="text-[10px] text-white/30">
                    {new Date(client.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
