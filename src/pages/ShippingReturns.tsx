import Layout from "@/components/layout/Layout";

const ShippingReturns = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold text-foreground mb-8">Shipping & Returns</h1>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-primary mb-4">Shipping Policy</h2>
            <div className="bg-card rounded-xl border border-primary/10 p-6 space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Standard Shipping</h3>
                <p className="text-muted-foreground">5-7 business days • Free on orders above ₹3,000</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Express Shipping</h3>
                <p className="text-muted-foreground">2-3 business days • ₹199</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Same Day Delivery</h3>
                <p className="text-muted-foreground">Available in select cities • ₹399</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-primary mb-4">Return Policy</h2>
            <div className="bg-card rounded-xl border border-primary/10 p-6 text-muted-foreground space-y-4">
              <p>
                We want you to be completely satisfied with your purchase. If you're not happy with your order,
                you can return it within 30 days of delivery for a full refund.
              </p>
              <h3 className="font-medium text-foreground">Conditions for Return:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Item must be unused and in original packaging</li>
                <li>All tags and labels must be attached</li>
                <li>Return must be initiated within 30 days of delivery</li>
                <li>Proof of purchase is required</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">How to Return</h2>
            <div className="bg-card rounded-xl border border-primary/10 p-6 text-muted-foreground">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account and go to Order History</li>
                <li>Select the item you want to return</li>
                <li>Choose your return reason</li>
                <li>Schedule a pickup or drop off at a partner location</li>
                <li>Refund will be processed within 5-7 business days</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingReturns;
