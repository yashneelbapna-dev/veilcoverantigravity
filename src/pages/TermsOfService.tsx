import Layout from "@/components/layout/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <div className="bg-card rounded-2xl border border-primary/10 p-8 text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Acceptance of Terms</h2>
              <p>
                By accessing or using VEIL's website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Products & Pricing</h2>
              <p>
                All prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to modify prices without prior notice. Product images are for illustration purposes and may vary slightly from actual products.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Orders & Payment</h2>
              <p>
                By placing an order, you warrant that you are legally capable of entering into binding contracts. We accept major credit cards, debit cards, UPI, and net banking.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Intellectual Property</h2>
              <p>
                All content on this website, including designs, logos, and text, is the property of VEIL and is protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
              <p>
                VEIL shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-4 border-t border-primary/10">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
