import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    category: "Orders & Shipping",
    items: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 5-7 business days within India. Express shipping (2-3 business days) is available at checkout for an additional fee.",
      },
      {
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free standard shipping on all orders above ₹3,000.",
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely! Once your order ships, you'll receive a tracking link via email and SMS.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unused items in original packaging. Simply initiate a return through your account or contact us.",
      },
      {
        question: "How long do refunds take?",
        answer: "Refunds are processed within 5-7 business days after we receive your return. The amount will be credited to your original payment method.",
      },
    ],
  },
  {
    category: "Products",
    items: [
      {
        question: "Are your cases compatible with wireless charging?",
        answer: "Yes! All our phone cases are designed to be compatible with Qi wireless charging and MagSafe.",
      },
      {
        question: "What materials do you use?",
        answer: "We use premium materials including full-grain leather, aerospace-grade aluminum, eco-friendly TPU, and high-quality polycarbonate.",
      },
      {
        question: "Do your cases have a warranty?",
        answer: "All VEIL products come with a 1-year warranty against manufacturing defects.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <Layout>
      <div className="container-veil py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
            <p className="mt-4 text-muted-foreground">
              Find answers to common questions about our products and services
            </p>
          </div>

          <div className="space-y-8">
            {faqData.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-semibold text-primary mb-4">{section.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.items.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${section.category}-${index}`}
                      className="border border-primary/10 rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="text-foreground hover:text-primary hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
