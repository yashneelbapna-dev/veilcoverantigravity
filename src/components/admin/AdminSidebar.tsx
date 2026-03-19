import { 
  LayoutGrid, 
  Package, 
  Truck, 
  Users, 
  Shield,
  Database,
  MessageSquare,
  Tag
} from "lucide-react";

export type AdminTab = 
  | "overview" 
  | "inventory" 
  | "orders" 
  | "clients" 
  | "audit" 
  | "user-data"
  | "contact-messages"
  | "discount-coupons"
  | "chat-logs";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: Truck },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "clients", label: "Clients", icon: Users },
];

const MGMT_ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "contact-messages", label: "Messages", icon: MessageSquare },
  { id: "discount-coupons", label: "Coupons", icon: Tag },
  { id: "chat-logs", label: "Chat Logs", icon: MessageSquare },
  { id: "user-data", label: "User Data", icon: Database },
  { id: "audit", label: "Audit Logs", icon: Shield },
];

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  return (
    <aside className="w-64 flex flex-col h-screen admin-glass-panel border-r border-[hsl(45_76%_52%/0.12)] rounded-none shrink-0">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="size-9 admin-gold-gradient-bg rounded-lg flex items-center justify-center shadow-lg">
            <Shield className="h-5 w-5 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] admin-gold-text">VEIL</h1>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`admin-nav-item w-full ${activeTab === item.id ? "active" : ""}`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-widest">{item.label}</span>
          </button>
        ))}

        {/* Management Section */}
        <div className="pt-8 pb-4 px-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Management</p>
        </div>

        {MGMT_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`admin-nav-item w-full ${activeTab === item.id ? "active" : ""}`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6">
        <div className="admin-glass-panel rounded-xl p-4 bg-white/5">
          <p className="text-[10px] text-[hsl(45,76%,52%)] font-bold uppercase tracking-widest mb-1">
            Elite Support
          </p>
          <p className="text-[10px] text-white/40 leading-relaxed">Concierge available 24/7</p>
        </div>
      </div>
    </aside>
  );
};
