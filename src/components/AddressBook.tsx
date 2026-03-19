import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Star, Trash2, Edit2, X, Check, Loader2 } from "lucide-react";
import { indianStates, citiesByState, validatePincode } from "@/data/indianLocations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export interface UserAddress {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  address_line1: string;
  address_line2: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AddressFormData {
  name: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  address_line1: string;
  address_line2: string;
  is_default: boolean;
}

const initialFormData: AddressFormData = {
  name: "",
  phone: "",
  pincode: "",
  state: "",
  city: "",
  address_line1: "",
  address_line2: "",
  is_default: false,
};

export const AddressBook = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});
  const [citySearch, setCitySearch] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses((data as UserAddress[]) || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    
    const pincodeValidation = validatePincode(formData.pincode, formData.state);
    if (!pincodeValidation.valid) newErrors.pincode = pincodeValidation.message;
    
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.address_line1.trim()) newErrors.address_line1 = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: digits });
  };

  const handleSubmit = async () => {
    if (!user || !validateForm()) return;
    
    setSaving(true);
    try {
      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from("user_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const addressData = {
        user_id: user.id,
        name: formData.name.trim(),
        phone: formData.phone.replace(/[^0-9]/g, ""),
        pincode: formData.pincode,
        state: formData.state,
        city: formData.city,
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim() || null,
        is_default: formData.is_default || addresses.length === 0,
      };

      if (editingId) {
        const { error } = await supabase
          .from("user_addresses")
          .update(addressData)
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) throw error;
        toast({ title: "Address updated" });
      } else {
        const { error } = await supabase
          .from("user_addresses")
          .insert(addressData);
        if (error) throw error;
        toast({ title: "Address added" });
      }

      await fetchAddresses();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const addressToDelete = addresses.find(a => a.id === id);
    
    // Optimistic UI: remove immediately
    setAddresses(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
    
    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      
      // If deleted was default, set next one as default
      if (addressToDelete?.is_default) {
        const remaining = addresses.filter(a => a.id !== id);
        if (remaining.length > 0) {
          await supabase
            .from("user_addresses")
            .update({ is_default: true })
            .eq("id", remaining[0].id)
            .eq("user_id", user.id);
        }
      }
      
      await fetchAddresses();
      toast({ title: "Address removed" });
    } catch (error: any) {
      // Revert on error
      if (addressToDelete) {
        setAddresses(prev => [...prev, addressToDelete]);
      }
      toast({ title: "Error", description: "Could not remove address. Please try again.", variant: "destructive" });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
      
      const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
      
      await fetchAddresses();
      toast({ title: "Default address updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (address: UserAddress) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      pincode: address.pincode,
      state: address.state,
      city: address.city,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
    setCitySearch("");
  };

  const availableCities = formData.state ? citiesByState[formData.state] || [] : [];
  const filteredCities = citySearch 
    ? availableCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
    : availableCities;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Book
        </h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 glass-button-primary">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {editingId ? "Edit Address" : "New Address"}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => handlePhoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                className={errors.phone ? "border-destructive" : ""}
                placeholder="10-digit number"
              />
              {errors.phone && <p className="text-sm text-[hsl(0,84%,60%)] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>State</Label>
              <Select
                value={formData.state}
                onValueChange={(v) => setFormData({ ...formData, state: v, city: "" })}
              >
                <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
            </div>
            <div>
              <Label>City</Label>
              <Select
                value={formData.city}
                onValueChange={(v) => setFormData({ ...formData, city: v })}
                disabled={!formData.state}
              >
                <SelectTrigger className={errors.city ? "border-destructive" : ""}>
                  <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="p-2">
                    <Input
                      placeholder="Search city..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                className={errors.pincode ? "border-destructive" : ""}
                maxLength={6}
                placeholder="6-digit pincode"
              />
              {errors.pincode && <p className="text-sm text-destructive mt-1">{errors.pincode}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              className={errors.address_line1 ? "border-destructive" : ""}
              placeholder="House no., Building, Street"
            />
            {errors.address_line1 && <p className="text-sm text-destructive mt-1">{errors.address_line1}</p>}
          </div>

          <div>
            <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Landmark, Area"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="is_default" className="text-sm cursor-pointer">
              Set as default address
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} isLoading={saving} loadingText={editingId ? "Updating..." : "Saving..."} className="gap-2">
              <Check className="h-4 w-4" />
              {editingId ? "Update" : "Save"} Address
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No saved addresses</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`glass-card rounded-xl p-4 relative ${
                address.is_default ? "ring-2 ring-primary/50" : ""
              }`}
            >
              {address.is_default && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  Default
                </div>
              )}
              
              <div className="pr-16">
                <p className="font-semibold text-foreground">{address.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  📞 {address.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(address)}
                  className="gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                {!address.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Star className="h-3 w-3" />
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirmId(address.id)}
                  className="gap-1 text-destructive hover:text-destructive ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this address?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressBook;
