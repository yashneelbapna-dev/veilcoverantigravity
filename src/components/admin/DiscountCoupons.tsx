import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Copy, Check } from "lucide-react";

interface DiscountCoupon {
  id: string;
  email: string;
  coupon_code: string;
  source: string;
  is_used: boolean;
  created_at: string;
}

export const DiscountCoupons = () => {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('discount_coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const usedCount = coupons.filter(c => c.is_used).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(45,76%,52%)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-glass-panel p-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Signups</p>
          <p className="text-2xl font-bold">{coupons.length}</p>
        </div>
        <div className="admin-glass-panel p-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Coupons Used</p>
          <p className="text-2xl font-bold text-[hsl(45,76%,52%)]">{usedCount}</p>
        </div>
        <div className="admin-glass-panel p-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Unused</p>
          <p className="text-2xl font-bold">{coupons.length - usedCount}</p>
        </div>
      </div>

      {/* Coupons table */}
      <div className="admin-glass-panel overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No discount signups yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Coupon Code</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <p className="text-xs font-medium text-white">{coupon.email}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-[hsl(45,76%,52%)] bg-[hsl(45,76%,52%,0.1)] px-2 py-1 rounded">
                          {coupon.coupon_code}
                        </code>
                        <button
                          onClick={() => handleCopy(coupon.coupon_code, coupon.id)}
                          className="p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          {copiedId === coupon.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-white/30" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">{coupon.source.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${coupon.is_used ? 'admin-badge-neutral' : 'admin-badge-gold'}`}>
                        {coupon.is_used ? 'Used' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] text-white/30">
                        {new Date(coupon.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
