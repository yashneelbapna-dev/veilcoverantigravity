import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Wallet, Loader2, MapPin, Tag, X } from "lucide-react";
import { validateCheckoutShipping, type CheckoutShippingData } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/errors";

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface SavedCoupon {
  code: string;
  discount: number;
  type: string;
  expires: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const isCheckingOut = useRef(false);
  const currentStep = parseInt(searchParams.get("step") || "1");
  const txnId = searchParams.get("txnId");
  const returnOrderId = searchParams.get("orderId");

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("phonepe");
  const [loading, setLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<SavedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [savedCoupon, setSavedCoupon] = useState<SavedCoupon | null>(null);

  // Load saved coupon from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("veil_coupon");
      if (stored) {
        const parsed: SavedCoupon = JSON.parse(stored);
        if (parsed.expires > Date.now()) {
          setSavedCoupon(parsed);
        } else {
          localStorage.removeItem("veil_coupon");
        }
      }
    } catch {}
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      
      setLoadingAddresses(true);
      try {
        const { data, error } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (error) throw error;
        setSavedAddresses(data || []);

        // Auto-select default address
        const defaultAddress = data?.find(a => a.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          applyAddress(defaultAddress);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const applyAddress = (address: SavedAddress) => {
    setShipping(prev => ({
      ...prev,
      fullName: address.name,
      phone: address.phone,
      address: address.address_line1 + (address.address_line2 ? `, ${address.address_line2}` : ""),
      city: address.city,
      state: address.state,
      postalCode: address.pincode,
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      applyAddress(address);
    }
  };

  // Prefill email from user profile
  useEffect(() => {
    const prefillEmail = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.email || user.email) {
          setShipping(prev => ({
            ...prev,
            email: data?.email || user.email || prev.email,
          }));
        }
      }
    };
    prefillEmail();
  }, [user]);

  // Handle payment return from PhonePe
  useEffect(() => {
    const verifyPayment = async () => {
      if (txnId && returnOrderId && user) {
        isCheckingOut.current = true;
        setVerifyingPayment(true);
        try {
          const { data, error } = await supabase.functions.invoke("phonepe-verify", {
            body: {
              transactionId: txnId,
              orderId: returnOrderId,
            },
          });

          if (error) throw error;

          if (data.success) {
            sessionStorage.setItem("order_placed", returnOrderId);
            clearCart();
            localStorage.removeItem("veil_coupon");
            toast({
              title: "Payment Successful!",
              description: "Your order has been confirmed.",
            });
            navigate(`/checkout/confirmation?order=${returnOrderId}`, { replace: true });
          } else {
            toast({
              title: "Payment Failed",
              description: data.message || "Please try again.",
              variant: "destructive",
            });
            isCheckingOut.current = false;
            setSearchParams({ step: "3" });
          }
        } catch (error: any) {
          console.error("Payment verification error:", error);
          toast({
            title: "Verification Failed",
            description: "Could not verify payment. Please contact support.",
            variant: "destructive",
          });
          isCheckingOut.current = false;
          setSearchParams({ step: "3" });
        } finally {
          setVerifyingPayment(false);
        }
      }
    };

    verifyPayment();
  }, [txnId, returnOrderId, user]);

  // Redirect to shop if cart is empty and not mid-checkout
  useEffect(() => {
    // Skip redirect if we just placed an order
    const orderPlaced = sessionStorage.getItem("order_placed");
    if (items.length === 0 && !isCheckingOut.current && !txnId && !verifyingPayment && !orderPlaced) {
      navigate("/shop", { replace: true });
    }
  }, [items, navigate, txnId, verifyingPayment]);

  const subtotal = getCartTotal();
  const shippingCost = subtotal >= 2000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const discount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  const total = subtotal + shippingCost + tax - discount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setShipping({ ...shipping, phone: digits });
    if (selectedAddressId) setSelectedAddressId(null);
  };

  const validateShipping = (): boolean => {
    const result = validateCheckoutShipping(shipping);
    
    if (!result.success) {
      setErrors(result.errors as Partial<ShippingAddress>);
      return false;
    }

    // Extra phone validation
    const phoneDigits = shipping.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid 10-digit mobile number" }));
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleApplyCoupon = async (code: string) => {
    setCouponError("");
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    // Check against saved coupon
    if (savedCoupon && savedCoupon.code.toUpperCase() === trimmedCode && savedCoupon.expires > Date.now()) {
      setAppliedCoupon(savedCoupon);
      setCouponCode(trimmedCode);
      toast({ title: "Coupon applied!", description: `${trimmedCode} — ${savedCoupon.discount}% off` });
      return;
    }

    // Check against DB
    try {
      const { data, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .eq("coupon_code", trimmedCode)
        .eq("is_used", false)
        .maybeSingle();

      if (error || !data) {
        setCouponError("Invalid or expired coupon code");
        return;
      }

      setAppliedCoupon({ code: trimmedCode, discount: 10, type: "percentage", expires: Date.now() + 86400000 });
      setCouponCode(trimmedCode);
      toast({ title: "Coupon applied!", description: `${trimmedCode} — 10% off` });
    } catch {
      setCouponError("Could not verify coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateShipping()) return;
      
      // Save new address if it doesn't match any saved address
      if (user && !selectedAddressId) {
        try {
          await supabase.from("user_addresses").insert({
            user_id: user.id,
            name: shipping.fullName,
            phone: shipping.phone.replace(/\D/g, ""),
            address_line1: shipping.address,
            city: shipping.city,
            state: shipping.state,
            pincode: shipping.postalCode,
            is_default: savedAddresses.length === 0,
          });
        } catch (error) {
          console.error("Error saving address:", error);
        }
      }
    }
    setSearchParams({ step: String(currentStep + 1) });
  };

  const handlePrevStep = () => {
    setSearchParams({ step: String(currentStep - 1) });
  };

  const generateOrderNumber = () => {
    return `VEIL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    isCheckingOut.current = true;
    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const phoneDigits = shipping.phone.replace(/\D/g, "");
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        model: item.selectedModel,
        image: item.product.image,
      }));

      // Save shipping address to user_addresses table (secure storage)
      const { data: savedAddress, error: addressError } = await supabase
        .from("user_addresses")
        .insert({
          user_id: user.id,
          name: shipping.fullName,
          phone: phoneDigits,
          address_line1: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.postalCode,
        })
        .select('id')
        .single();

      if (addressError) throw addressError;

      const shippingAddressSummary = {
        fullName: shipping.fullName,
        email: shipping.email,
        phone: phoneDigits,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.postalCode,
        country: shipping.country,
      };

      const { error: orderError } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: user.id,
        phone: phoneDigits,
        items: orderItems as unknown as any,
        shipping_address: shippingAddressSummary as unknown as any,
        address_id: savedAddress.id,
        subtotal,
        tax,
        shipping: shippingCost,
        total,
        payment_method: paymentMethod === "cod" ? "COD" : paymentMethod.toUpperCase(),
        order_status: paymentMethod === "cod" ? "ordered" : "pending",
        payment_status: paymentMethod === "cod" ? "cod" : "pending",
      });

      if (orderError) throw orderError;

      // Mark coupon as used if applied
      if (appliedCoupon) {
        try {
          await supabase.from("discount_coupons")
            .update({ is_used: true })
            .eq("coupon_code", appliedCoupon.code);
        } catch {}
        localStorage.removeItem("veil_coupon");
      }

      // If PhonePe payment, initiate payment
      if (paymentMethod === "phonepe") {
        const amountInPaise = Math.round(total * 100);
        
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          "phonepe-initiate",
          {
            body: {
              amount: amountInPaise,
              orderId: orderNumber,
              customerPhone: phoneDigits,
              customerEmail: shipping.email,
              redirectUrl: `${window.location.origin}/checkout`,
            },
          }
        );

        if (paymentError) {
          await supabase.from("orders").delete().eq("order_number", orderNumber);
          throw new Error("Payment service unavailable. Please try again.");
        }

        if (!paymentData?.success) {
          await supabase.from("orders").delete().eq("order_number", orderNumber);
          throw new Error("Payment initiation failed. Please try again.");
        }

        await supabase.from("orders")
          .update({ transaction_id: paymentData.transactionId })
          .eq("order_number", orderNumber);

        if (paymentData.redirectUrl) {
          try {
            const redirectUrl = new URL(paymentData.redirectUrl);
            const allowedPhonePeHosts = [
              'api-preprod.phonepe.com',
              'api.phonepe.com',
              'mercury-uat.phonepe.com',
              'mercury.phonepe.com'
            ];
            if (!allowedPhonePeHosts.includes(redirectUrl.hostname)) {
              throw new Error("Invalid payment gateway URL");
            }
            window.location.href = paymentData.redirectUrl;
            return;
          } catch (urlError) {
            throw new Error("Payment gateway error. Please try again.");
          }
        } else {
          throw new Error("Payment gateway error. Please try again.");
        }
      }

      // For other payment methods (demo mode)
      try {
        await supabase.functions.invoke("send-order-confirmation", {
          body: {
            customerEmail: shipping.email,
            customerName: shipping.fullName,
            orderNumber,
            items: orderItems,
            subtotal,
            shipping: shippingCost,
            tax,
            total,
            shippingAddress: {
              fullName: shipping.fullName,
              address: shipping.address,
              city: shipping.city,
              state: shipping.state,
              pincode: shipping.postalCode,
              phone: phoneDigits,
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      sessionStorage.setItem("order_placed", orderNumber);
      clearCart();
      localStorage.removeItem("veil_coupon");
      navigate(`/checkout/confirmation?order=${orderNumber}`, { replace: true });
    } catch (error: any) {
      isCheckingOut.current = false;
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "checkout_failed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              currentStep >= step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > step ? <Check className="h-5 w-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 sm:w-24 h-1 mx-2 ${
                currentStep > step ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderShippingForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Shipping Address</h2>
      
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3 mb-6">
          <Label className="text-sm font-medium">Saved Addresses</Label>
          <RadioGroup value={selectedAddressId || ""} onValueChange={handleAddressSelect}>
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedAddressId === address.id
                    ? "border-primary bg-primary/5"
                    : "border-primary/20 hover:border-primary/40"
                }`}
                onClick={() => handleAddressSelect(address.id)}
              >
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{address.name}</span>
                    {address.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.address_line1}, {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                </div>
              </div>
            ))}
            
            {/* New Address Option */}
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedAddressId === null
                  ? "border-primary bg-primary/5"
                  : "border-primary/20 hover:border-primary/40"
              }`}
              onClick={() => {
                setSelectedAddressId(null);
                setShipping({
                  fullName: "",
                  email: shipping.email,
                  phone: "",
                  address: "",
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "India",
                });
              }}
            >
              <RadioGroupItem value="" id="new-address" />
              <Label htmlFor="new-address" className="cursor-pointer font-medium">
                + Add New Address
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Address Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={shipping.fullName}
            onChange={(e) => {
              setShipping({ ...shipping, fullName: e.target.value });
              if (selectedAddressId) setSelectedAddressId(null);
            }}
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={shipping.email}
            onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone Number (10 digits) *</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
          value={shipping.phone}
          onChange={(e) => handlePhoneInput(e.target.value)}
          onKeyDown={(e) => {
            if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && !e.ctrlKey && !e.metaKey) {
              e.preventDefault();
            }
          }}
          placeholder="9876543210"
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && <p className="text-sm text-[hsl(0,84%,60%)] mt-1">{errors.phone}</p>}
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={shipping.address}
          onChange={(e) => {
            setShipping({ ...shipping, address: e.target.value });
            if (selectedAddressId) setSelectedAddressId(null);
          }}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={shipping.city}
            onChange={(e) => {
              setShipping({ ...shipping, city: e.target.value });
              if (selectedAddressId) setSelectedAddressId(null);
            }}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={shipping.state}
            onChange={(e) => {
              setShipping({ ...shipping, state: e.target.value });
              if (selectedAddressId) setSelectedAddressId(null);
            }}
            className={errors.state ? "border-destructive" : ""}
          />
          {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="postalCode">Pincode (6 digits)</Label>
          <Input
            id="postalCode"
            value={shipping.postalCode}
            onChange={(e) => {
              setShipping({ ...shipping, postalCode: e.target.value.replace(/\D/g, "").slice(0, 6) });
              if (selectedAddressId) setSelectedAddressId(null);
            }}
            placeholder="400001"
            className={errors.postalCode ? "border-destructive" : ""}
          />
          {errors.postalCode && <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>}
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={shipping.country} disabled className="bg-muted" />
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Payment Method</h2>
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
        <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
          paymentMethod === "phonepe" ? "border-[#5f259f] bg-[#5f259f]/5" : "border-primary/20 hover:border-primary"
        }`}>
          <RadioGroupItem value="phonepe" id="phonepe" />
          <Label htmlFor="phonepe" className="flex items-center gap-3 cursor-pointer flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#5f259f] flex items-center justify-center">
              <span className="text-white font-bold text-sm">Pe</span>
            </div>
            <div>
              <p className="font-medium">PhonePe — Pay Now</p>
              <p className="text-sm text-muted-foreground">UPI, Cards, Wallets & More</p>
            </div>
            <span className="ml-auto text-xs bg-success/20 text-success px-2 py-1 rounded-full">
              Sandbox Mode
            </span>
          </Label>
        </div>
        <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
          paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary"
        }`}>
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
      {paymentMethod === "phonepe" && (
        <div className="p-4 rounded-lg bg-[#5f259f]/10 border border-[#5f259f]/30">
          <p className="text-sm text-foreground font-medium mb-1">🧪 PhonePe Sandbox Mode</p>
          <p className="text-sm text-muted-foreground">
            This is a test payment. Use any PhonePe sandbox test credentials to complete the payment.
            No real money will be charged.
          </p>
        </div>
      )}
      {paymentMethod === "cod" && (
        <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            Pay with cash when your order is delivered. No advance payment required.
          </p>
        </div>
      )}
    </div>
  );

  const renderOrderReview = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Order Review</h2>
      
      {/* Items */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Items ({items.length})</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 p-3 rounded-lg bg-muted/30">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.selectedColor} • {item.selectedModel} • Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium text-foreground">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="p-4 rounded-lg border border-primary/10">
        <h3 className="font-medium text-foreground mb-2">Shipping Address</h3>
        <p className="text-muted-foreground">
          {shipping.fullName}<br />
          {shipping.address}<br />
          {shipping.city}, {shipping.state} {shipping.postalCode}<br />
          {shipping.country}<br />
          {shipping.phone}
        </p>
      </div>

      {/* Payment Method */}
      <div className="p-4 rounded-lg border border-primary/10">
        <h3 className="font-medium text-foreground mb-2">Payment Method</h3>
        <p className="text-muted-foreground capitalize">
          {paymentMethod === "phonepe" ? "PhonePe — Pay Now" : paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod.toUpperCase()}
        </p>
      </div>
    </div>
  );

  const renderCouponSection = () => (
    <div className="bg-card rounded-xl border border-primary/20 p-6 mt-4">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Coupon Code
      </h3>

      {/* Show saved coupon if available and not yet applied */}
      {savedCoupon && !appliedCoupon && (
        <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">🏷️ Available Coupon</p>
              <p className="text-xs text-muted-foreground">{savedCoupon.code} — {savedCoupon.discount}% off</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleApplyCoupon(savedCoupon.code)}
              className="bg-primary text-primary-foreground"
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">{appliedCoupon.code} applied — {appliedCoupon.discount}% off</span>
          </div>
          <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
            placeholder="Enter coupon code"
            className="flex-1"
          />
          <Button
            onClick={() => handleApplyCoupon(couponCode)}
            variant="outline"
            className="border-primary/20"
          >
            Apply
          </Button>
        </div>
      )}
      {couponError && <p className="text-sm text-[hsl(0,84%,60%)] mt-2">{couponError}</p>}
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-card rounded-xl border border-primary/20 p-6">
      <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-success">Discount ({appliedCoupon?.discount}%)</span>
            <span className="text-success">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">
            {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (18% GST)</span>
          <span className="text-foreground">{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-primary/10 pt-3 flex justify-between font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  // Show loading state while verifying payment
  if (verifyingPayment) {
    return (
      <Layout>
        <div className="container-veil py-24 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-[#5f259f] mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground text-center">
            Please wait while we confirm your payment with PhonePe...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-veil py-12">
        <h1 className="text-3xl font-bold text-foreground text-center mb-8">Checkout</h1>
        
        {renderStepIndicator()}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-primary/20 p-6">
            {currentStep === 1 && renderShippingForm()}
            {currentStep === 2 && renderPaymentForm()}
            {currentStep === 3 && renderOrderReview()}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-primary/10">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevStep} className="flex-1" disabled={loading}>
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button onClick={handleNextStep} className="flex-1 bg-primary text-primary-foreground ripple-effect">
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  isLoading={loading}
                  loadingText="Processing..."
                  className={`flex-1 ripple-effect ${
                    paymentMethod === "phonepe" 
                      ? "bg-[#5f259f] hover:bg-[#5f259f]/90 text-white" 
                      : "pay-button gold-ripple touch-ripple"
                  }`}
                >
                  {`Pay ${formatPrice(total)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {renderOrderSummary()}
            {renderCouponSection()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
