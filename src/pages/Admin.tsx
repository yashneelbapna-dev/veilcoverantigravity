import { useEffect, useState } from "react";
import "@/styles/admin.css";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuditLog } from "@/hooks/useAuditLog";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, ShoppingBag, IndianRupee, TrendingUp, Download, Loader2,
  Bell, Search, ChevronDown
} from "lucide-react";
import { exportOrdersToCSV, exportInventoryToCSV } from "@/utils/csvExport";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { InventoryManagement } from "@/components/admin/InventoryManagement";
import { UserDataViewer } from "@/components/admin/UserDataViewer";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { ContactMessages } from "@/components/admin/ContactMessages";
import { DiscountCoupons } from "@/components/admin/DiscountCoupons";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { ChatLogs } from "@/components/admin/ChatLogs";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrder: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  in_stock: boolean;
  category: string | null;
  collection: string | null;
  images: string[];
  colors: string[];
  models: string[];
}

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

const TAB_TITLES: Record<AdminTab, { subtitle: string; title: string; accent: string }> = {
  overview: { subtitle: new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), title: "Executive", accent: "Dashboard" },
  orders: { subtitle: "Order Management", title: "Live Order", accent: "Stream" },
  inventory: { subtitle: "Product Management", title: "Inventory", accent: "Vault" },
  clients: { subtitle: "Customer Intelligence", title: "Client", accent: "Ledger" },
  "user-data": { subtitle: "Data Management", title: "User", accent: "Storage" },
  audit: { subtitle: "Security & Compliance", title: "Audit", accent: "Trail" },
  "contact-messages": { subtitle: "Customer Communication", title: "Contact", accent: "Messages" },
  "discount-coupons": { subtitle: "Promotions & Discounts", title: "Discount", accent: "Coupons" },
  "chat-logs": { subtitle: "AI Support", title: "Chat", accent: "Logs" },
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { logAction } = useAuditLog();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrder: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancellingOrphans, setCancellingOrphans] = useState(false);

  const handleExportOrders = async () => {
    exportOrdersToCSV(orders);
    await logAction("export_orders", "export", undefined, { count: orders.length });
  };

  const handleCancelOrphanOrders = async () => {
    setCancellingOrphans(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-orphan-orders");
      if (error) throw error;
      toast({
        title: "Orphan Orders Processed",
        description: `${data?.cancelled || 0} orders cancelled and users notified via email.`,
      });
      await logAction("bulk_update" as any, "order" as any, undefined, data);
      fetchDashboardData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCancellingOrphans(false);
    }
  };

  const handleExportInventory = async () => {
    exportInventoryToCSV(products);
    await logAction("export_inventory", "export", undefined, { count: products.length });
  };


  useEffect(() => {
    if (user && isAdmin && !authLoading && !adminLoading) {
      fetchDashboardData();
    }
  }, [user, isAdmin, authLoading, adminLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, tracking_number, carrier, estimated_delivery, shipped_at, delivered_at')
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('stock_quantity', { ascending: true });

      const allProfiles = profilesData || [];
      const allProducts = productsData || [];
      
      const profileMap = new Map(allProfiles.map(p => [p.user_id, p]));
      
      const enrichedOrders = (ordersData || []).map(order => {
        const shippingAddress = order.shipping_address as any || {};
        const profile = profileMap.get(order.user_id);
        
        if ((!shippingAddress.email || !shippingAddress.fullName) && profile) {
          return {
            ...order,
            shipping_address: {
              ...shippingAddress,
              fullName: shippingAddress.fullName || profile.full_name || 'Unknown',
              email: shippingAddress.email || profile.email || 'No email',
            }
          };
        }
        return order;
      });

      const allOrders = enrichedOrders;
      const validOrders = allOrders.filter(order => order.order_status !== 'cancelled');

      const totalRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const avgOrder = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

      const monthlyMap: Record<string, number> = {};
      validOrders.forEach(order => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
        monthlyMap[month] = (monthlyMap[month] || 0) + order.total;
      });
      const monthlyChartData = Object.entries(monthlyMap).map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue)
      }));

      const statusMap: Record<string, number> = {};
      allOrders.forEach(order => {
        statusMap[order.order_status] = (statusMap[order.order_status] || 0) + 1;
      });
      const statusChartData = Object.entries(statusMap).map(([status, count]) => ({
        name: status === 'pending' ? 'Ordered' : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
        value: count
      }));

      setMetrics({
        totalUsers: usersCount || 0,
        totalOrders: allOrders.length,
        totalRevenue,
        avgOrder,
      });
      setProducts(allProducts);
      setOrders(allOrders);
      setMonthlyData(monthlyChartData);
      setStatusData(statusChartData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPriceRupees = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPricePaise = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  const GOLD_COLORS = ['hsl(45 76% 52%)', 'hsl(45 76% 52% / 0.6)', 'hsl(0 0% 20%)', 'hsl(0 0% 40%)'];

  if (authLoading || adminLoading) {
    return (
      <div className="admin-dashboard min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(45,76%,52%)]"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabInfo = TAB_TITLES[activeTab];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'shipped':
      case 'out_for_delivery':
        return 'admin-badge admin-badge-gold';
      case 'delivered':
        return 'admin-badge admin-badge-neutral';
      case 'cancelled':
        return 'admin-badge admin-badge-destructive';
      default:
        return 'admin-badge admin-badge-gold';
    }
  };

  return (
    <div className="admin-dashboard min-h-screen flex overflow-hidden">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[hsl(0,0%,2%,0.6)] backdrop-blur-xl border-b border-white/5 px-10 py-5 flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-[0.3em]">{tabInfo.subtitle}</p>
            <h2 className="text-xl font-light text-white mt-0.5">
              {tabInfo.title} <span className="font-bold admin-gold-text">{tabInfo.accent}</span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            {activeTab === "overview" && (
              <div className="flex gap-2">
                <button onClick={handleExportOrders} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:border-[hsl(45,76%,52%,0.3)] hover:text-[hsl(45,76%,52%)] transition-all flex items-center gap-2">
                  <Download className="h-3 w-3" /> Orders
                </button>
                <button onClick={handleExportInventory} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:border-[hsl(45,76%,52%,0.3)] hover:text-[hsl(45,76%,52%)] transition-all flex items-center gap-2">
                  <Download className="h-3 w-3" /> Inventory
                </button>
                <button onClick={handleCancelOrphanOrders} disabled={cancellingOrphans} className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400/60 text-[10px] font-bold uppercase tracking-widest hover:border-red-500/60 hover:text-red-400 transition-all flex items-center gap-2 disabled:opacity-50">
                  {cancellingOrphans ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />} Cancel Orphans
                </button>
              </div>
            )}
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Administrator</p>
              </div>
              <div className="size-9 rounded-lg border border-[hsl(45,76%,52%,0.3)] p-0.5 overflow-hidden bg-[hsl(0,0%,10%)] flex items-center justify-center">
                <span className="text-[hsl(45,76%,52%)] text-xs font-bold">
                  {(user?.email?.[0] || 'A').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-10 space-y-10 max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(45,76%,52%)]"></div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  {/* Metric Cards */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="admin-glass-panel p-8 relative overflow-hidden group hover:border-[hsl(45,76%,52%,0.4)] transition-all duration-500">
                      <div className="flex justify-between items-start mb-6">
                        <div className="size-12 rounded-xl bg-[hsl(45,76%,52%,0.1)] flex items-center justify-center admin-gold-glow">
                          <IndianRupee className="h-6 w-6 text-[hsl(45,76%,52%)]" />
                        </div>
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold tracking-tight">{formatPriceRupees(metrics.totalRevenue)}</p>
                    </div>

                    <div className="admin-glass-panel p-8 relative overflow-hidden group hover:border-[hsl(45,76%,52%,0.4)] transition-all duration-500">
                      <div className="flex justify-between items-start mb-6">
                        <div className="size-12 rounded-xl bg-[hsl(45,76%,52%,0.1)] flex items-center justify-center admin-gold-glow">
                          <ShoppingBag className="h-6 w-6 text-[hsl(45,76%,52%)]" />
                        </div>
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Orders</p>
                      <p className="text-3xl font-bold tracking-tight">{metrics.totalOrders.toLocaleString()}</p>
                    </div>

                    <div className="admin-glass-panel p-8 relative overflow-hidden group hover:border-[hsl(45,76%,52%,0.4)] transition-all duration-500">
                      <div className="flex justify-between items-start mb-6">
                        <div className="size-12 rounded-xl bg-[hsl(45,76%,52%,0.1)] flex items-center justify-center admin-gold-glow">
                          <Users className="h-6 w-6 text-[hsl(45,76%,52%)]" />
                        </div>
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Customers</p>
                      <p className="text-3xl font-bold tracking-tight">{metrics.totalUsers.toLocaleString()}</p>
                    </div>
                  </section>

                  {/* Charts */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 admin-glass-panel p-8">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h3 className="text-lg font-bold">Revenue Performance</h3>
                          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Monthly revenue stream</p>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyData}>
                            <defs>
                              <linearGradient id="goldLineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(45 76% 52%)" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="hsl(45 76% 52%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="hsl(0 0% 100% / 0.2)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(0 0% 100% / 0.2)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(0 0% 6%)', 
                                border: '1px solid hsl(45 76% 52% / 0.2)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '12px',
                              }}
                              formatter={(value: number) => [formatPriceRupees(value), 'Revenue']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="hsl(45 76% 52%)" 
                              strokeWidth={2.5} 
                              dot={{ fill: 'hsl(45 76% 52%)', r: 4, strokeWidth: 0 }}
                              activeDot={{ r: 6, fill: 'hsl(45 76% 52%)' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="admin-glass-panel p-8 flex flex-col">
                      <div className="mb-8">
                        <h3 className="text-lg font-bold">Order Status</h3>
                        <p className="text-[11px] text-white/40 uppercase tracking-widest">Distribution</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="none"
                              >
                                {statusData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'hsl(0 0% 6%)', 
                                  border: '1px solid hsl(45 76% 52% / 0.2)',
                                  borderRadius: '8px',
                                  color: 'white',
                                  fontSize: '11px',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-full space-y-3 mt-4">
                          {statusData.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full" style={{ backgroundColor: GOLD_COLORS[index % GOLD_COLORS.length] }}></div>
                                <span className="text-[10px] text-white/60 font-medium">{item.name}</span>
                              </div>
                              <span className="text-[10px] font-bold">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Live Order Stream */}
                  <section>
                    <div className="flex justify-between items-center mb-6 px-2">
                      <h3 className="text-lg font-bold tracking-tight">Live Order Stream</h3>
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time Updates</span>
                      </div>
                    </div>
                    <div className="admin-glass-panel overflow-hidden">
                      <div className="overflow-x-auto">
                        <table>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Client</th>
                              <th>Order ID</th>
                              <th>Status</th>
                              <th className="text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 8).map((order) => {
                              const address = order.shipping_address as any;
                              const items = order.items as any[];
                              const productName = items?.length > 0 
                                ? items.map((i: any) => i.name).join(', ')
                                : 'Unknown';
                              const customerName = address?.fullName || 'Unknown';
                              const displayStatus = order.order_status === 'pending' ? 'ordered' : order.order_status.replace(/_/g, ' ');

                              return (
                                <tr key={order.id}>
                                  <td>
                                    <div>
                                      <p className="text-xs font-bold text-white">{productName}</p>
                                    </div>
                                  </td>
                                  <td className="text-xs font-medium">{customerName}</td>
                                  <td className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    {order.order_number}
                                  </td>
                                  <td>
                                    <span className={getStatusBadgeClass(order.order_status)}>
                                      {displayStatus}
                                    </span>
                                  </td>
                                  <td className="text-right text-sm font-bold admin-gold-text">
                                    {formatPriceRupees(order.total)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "orders" && (
                <OrderManagement 
                  orders={orders} 
                  onOrderUpdate={fetchDashboardData} 
                  formatPrice={formatPriceRupees} 
                />
              )}

              {activeTab === "inventory" && (
                <InventoryManagement 
                  products={products} 
                  onProductUpdate={fetchDashboardData} 
                  formatPrice={formatPricePaise} 
                />
              )}

              {activeTab === "clients" && (
                <div className="admin-glass-panel overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-[hsl(45,76%,52%)]" />
                      <h3 className="text-lg font-bold">Client Ledger</h3>
                      <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                        {metrics.totalUsers} customers
                      </span>
                    </div>
                  </div>
                  <ClientsTable />
                </div>
              )}

              {activeTab === "user-data" && <UserDataViewer />}

              {activeTab === "audit" && <AuditLogs />}

              {activeTab === "contact-messages" && <ContactMessages />}

              {activeTab === "discount-coupons" && <DiscountCoupons />}

              {activeTab === "chat-logs" && <ChatLogs />}

            </>
          )}
        </div>

        {/* Footer */}
        <footer className="p-10 text-center border-t border-white/5">
          <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-bold">
            VEIL LUXURY ECOSYSTEM • ADMIN v4.2.0 • ALL RIGHTS RESERVED
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Admin;
