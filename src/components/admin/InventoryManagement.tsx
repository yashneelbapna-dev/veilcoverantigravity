import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Package, Plus, Edit2, Trash2, Upload, Loader2, ImageIcon } from "lucide-react";

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

interface InventoryManagementProps {
  products: Product[];
  onProductUpdate: () => void;
  formatPrice: (price: number) => string;
}

const CATEGORIES = ["phone-cases", "laptop-sleeves", "watch-accessories", "charging-solutions", "tech-addons", "organisers", "stationery", "stands"];
const COLLECTIONS = ["best-sellers", "new-arrivals", "iphone", "samsung", "pixel", "oneplus", "macbook", "ipad"];

export const InventoryManagement = ({ products, onProductUpdate, formatPrice }: InventoryManagementProps) => {
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", compare_price: "", stock_quantity: "100",
    category: "", collection: "", images: [] as string[], colors: "", models: "",
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", compare_price: "", stock_quantity: "100", category: "", collection: "", images: [], colors: "", models: "" });
  };

  const openAddDialog = () => { resetForm(); setIsAddDialogOpen(true); };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description || "", price: String(product.price / 100),
      compare_price: product.compare_price ? String(product.compare_price / 100) : "", stock_quantity: String(product.stock_quantity),
      category: product.category || "", collection: product.collection || "", images: product.images || [],
      colors: (product.colors || []).join(", "), models: (product.models || []).join(", "),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        newImages.push(publicUrl);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast({ title: "Images uploaded!", description: `${newImages.length} image(s) uploaded successfully.` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Failed to upload images", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Missing fields", description: "Name and price are required.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(), description: formData.description.trim() || null,
        price: Math.round(parseFloat(formData.price) * 100),
        compare_price: formData.compare_price ? Math.round(parseFloat(formData.compare_price) * 100) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 100, in_stock: parseInt(formData.stock_quantity) > 0,
        category: formData.category || null, collection: formData.collection || null, images: formData.images,
        colors: formData.colors.split(",").map(c => c.trim()).filter(Boolean),
        models: formData.models.split(",").map(m => m.trim()).filter(Boolean),
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
        if (error) throw error;
        await logAction("update_product", "product", editingProduct.id, { product_name: formData.name, changes: { stock_quantity: formData.stock_quantity, price: formData.price } });
        toast({ title: "Product updated!", description: `${formData.name} has been updated.` });
      } else {
        const { data: newProduct, error } = await supabase.from("products").insert(productData).select().single();
        if (error) throw error;
        await logAction("create_product", "product", newProduct?.id, { product_name: formData.name, price: formData.price, category: formData.category });
        toast({ title: "Product created!", description: `${formData.name} has been added to inventory.` });
      }
      setIsAddDialogOpen(false); setEditingProduct(null); resetForm(); onProductUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save product", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", deletingProduct.id);
      if (error) throw error;
      await logAction("delete_product", "product", deletingProduct.id, { product_name: deletingProduct.name });
      toast({ title: "Product deleted", description: `${deletingProduct.name} has been removed.` });
      setDeletingProduct(null); onProductUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" });
    }
  };

  const getStockPercentage = (qty: number) => Math.min(100, (qty / 500) * 100);
  const getStockLabel = (qty: number) => {
    if (qty < 5) return { label: "Critical", color: "text-red-500" };
    if (qty < 15) return { label: `${Math.round(getStockPercentage(qty))}%`, color: "text-[hsl(45,76%,52%)]" };
    return { label: `${Math.round(getStockPercentage(qty))}%`, color: "text-white/40" };
  };

  return (
    <>
      <div className="admin-glass-panel overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-[hsl(45,76%,52%)]" />
            <h3 className="text-lg font-bold">Inventory Vault</h3>
            <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
              {products.length} products
            </span>
          </div>
          <button onClick={openAddDialog} className="admin-gold-gradient-bg text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-white/40 text-center py-12">No products in inventory</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Inventory Status</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockPct = getStockPercentage(product.stock_quantity);
                  const stockInfo = getStockLabel(product.stock_quantity);
                  const isCritical = product.stock_quantity < 5;

                  return (
                    <tr key={product.id} className="group">
                      <td>
                        <div className="flex items-center gap-5">
                          <div className="size-16 rounded-xl overflow-hidden border border-white/10 bg-black p-1 group-hover:border-[hsl(45,76%,52%,0.4)] transition-colors shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-white/20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{product.name}</p>
                            <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mt-1">
                              {product.category?.replace(/-/g, ' ') || 'Uncategorized'}
                            </p>
                            {product.models?.[0] && (
                              <p className="text-[10px] text-[hsl(45,76%,52%)] mt-0.5">{product.models[0]}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="w-48">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-bold text-white">
                              {product.stock_quantity} <span className="text-white/30 font-medium">/ 500</span>
                            </span>
                            <span className={`text-[10px] font-bold uppercase ${stockInfo.color}`}>{stockInfo.label}</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className={`admin-progress-fill ${isCritical ? 'critical' : ''}`} style={{ width: `${stockPct}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm font-bold admin-gold-text tracking-tight">{formatPrice(product.price)}</p>
                      </td>
                      <td>
                        <span className={product.in_stock ? 'admin-badge admin-badge-gold' : 'admin-badge admin-badge-destructive'}>
                          {product.in_stock ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditDialog(product)} className="size-9 rounded-lg flex items-center justify-center hover:bg-[hsl(45,76%,52%,0.1)] transition-colors">
                            <Edit2 className="h-4 w-4 text-white/30 hover:text-[hsl(45,76%,52%)]" />
                          </button>
                          <button onClick={() => setDeletingProduct(product)} className="size-9 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors">
                            <Trash2 className="h-4 w-4 text-white/30 hover:text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || !!editingProduct} onOpenChange={(open) => { if (!open) { setIsAddDialogOpen(false); setEditingProduct(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[hsl(0,0%,6%)] border-[hsl(45,76%,52%,0.15)] text-white">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription className="text-white/40">
              {editingProduct ? `Editing ${editingProduct.name}` : "Add a new product to your inventory"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-white/60">Product Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="iPhone 16 Pro Case" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Price (₹) *</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="2999" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Compare Price (₹)</Label>
                <Input type="number" value={formData.compare_price} onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })} placeholder="3999" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Stock Quantity</Label>
                <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} placeholder="100" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Category</Label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white">
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white/60">Collection</Label>
                <select value={formData.collection} onChange={(e) => setFormData({ ...formData, collection: e.target.value })} className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white">
                  <option value="">Select collection</option>
                  {COLLECTIONS.map(col => <option key={col} value={col}>{col.replace(/-/g, ' ')}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white/60">Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Premium protection..." rows={3} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white/60">Colors (comma separated)</Label>
                <Input value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} placeholder="Black, White, Navy Blue" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white/60">Models (comma separated)</Label>
                <Input value={formData.models} onChange={(e) => setFormData({ ...formData, models: e.target.value })} placeholder="iPhone 16, iPhone 16 Pro" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-white/60">Product Images</Label>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 hover:border-[hsl(45,76%,52%,0.3)] transition-all">
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" disabled={uploading} />
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer py-4">
                    {uploading ? <Loader2 className="h-8 w-8 text-white/40 animate-spin" /> : (
                      <>
                        <Upload className="h-8 w-8 text-white/20 mb-2" />
                        <span className="text-[10px] text-white/40">Click to upload images</span>
                      </>
                    )}
                  </label>
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group/img">
                          <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => { setIsAddDialogOpen(false); setEditingProduct(null); resetForm(); }} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="admin-gold-gradient-bg text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingProduct ? "Save Changes" : "Add Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent className="bg-[hsl(0,0%,6%)] border-[hsl(45,76%,52%,0.15)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
