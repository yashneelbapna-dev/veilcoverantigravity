import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Download, ArrowRight } from "lucide-react";

const CheckoutConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") || "VEIL-XXXXXX";

  // Clear the order_placed flag after displaying
  useEffect(() => {
    sessionStorage.removeItem("order_placed");
  }, []);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryDate = estimatedDelivery.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <div className="container-veil py-20">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully. We'll send you a confirmation email shortly.
          </p>

          {/* Order Details Card */}
          <div className="bg-card rounded-xl border border-primary/20 p-6 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono font-bold text-primary">{orderNumber}</span>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Estimated Delivery</p>
                  <p className="text-sm text-muted-foreground">{deliveryDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button asChild className="w-full bg-primary text-primary-foreground">
              <Link to="/account?tab=orders">
                <Package className="h-4 w-4 mr-2" />
                View Your Order
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:border-primary"
              disabled
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice (Coming Soon)
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/shop">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutConfirmation;
