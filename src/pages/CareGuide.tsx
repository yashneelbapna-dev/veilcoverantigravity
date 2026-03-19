import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Droplets, Wind, Sparkles, AlertTriangle } from "lucide-react";

const careInstructions = [
  {
    icon: Droplets,
    title: "Cleaning",
    description: "Gently wipe with a soft, damp cloth. Avoid harsh chemicals or abrasive materials."
  },
  {
    icon: Wind,
    title: "Drying",
    description: "Air dry naturally. Never use heat sources like hair dryers or direct sunlight."
  },
  {
    icon: Sparkles,
    title: "Maintenance",
    description: "Remove case weekly to clean phone and case interior. This prevents dust buildup."
  },
  {
    icon: AlertTriangle,
    title: "Avoid",
    description: "Keep away from sharp objects, extreme temperatures, and prolonged water exposure."
  }
];

const materialGuides = [
  {
    material: "Premium Leather",
    instructions: [
      "Use leather conditioner every 2-3 months to maintain suppleness",
      "Wipe with slightly damp cloth for daily cleaning",
      "Allow natural patina to develop over time",
      "Store in cool, dry place when not in use"
    ]
  },
  {
    material: "Silicone",
    instructions: [
      "Wash with mild soap and water as needed",
      "Dry completely before reattaching to phone",
      "Avoid oil-based products that may degrade material",
      "Replace if you notice yellowing or loss of grip"
    ]
  },
  {
    material: "Polycarbonate",
    instructions: [
      "Clean with microfiber cloth and screen cleaner",
      "Avoid acetone or alcohol-based cleaners",
      "Polish with plastic polish for minor scratches",
      "Keep away from extreme heat to prevent warping"
    ]
  },
  {
    material: "Fabric & Textile",
    instructions: [
      "Spot clean with mild detergent solution",
      "Use soft brush to remove lint and debris",
      "Allow to air dry completely before use",
      "Treat with fabric protector spray for stain resistance"
    ]
  }
];

const faqs = [
  {
    question: "How often should I clean my VEIL case?",
    answer: "We recommend a quick wipe-down weekly and a thorough cleaning monthly. If you expose your case to dirt, liquids, or other contaminants, clean it as soon as possible to prevent staining."
  },
  {
    question: "Can I use alcohol wipes on my case?",
    answer: "For silicone and polycarbonate cases, occasional use of alcohol wipes is fine. However, avoid using them on leather or fabric cases as they can cause drying and discoloration."
  },
  {
    question: "My leather case is developing marks. Is this normal?",
    answer: "Yes! Genuine leather develops a natural patina over time, which adds character and uniqueness to your case. This is a sign of quality leather and is completely normal."
  },
  {
    question: "How do I remove stubborn stains?",
    answer: "For most materials, a paste of baking soda and water applied gently can help lift stains. For leather, use a specialized leather cleaner. Always test on a hidden area first."
  },
  {
    question: "Will my case protect against drops?",
    answer: "VEIL cases are designed for everyday protection against minor drops and scratches. For extreme protection needs, consider our Rugged Collection designed for higher impact resistance."
  }
];

const CareGuide = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-secondary">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <h1 className="text-display-lg font-light text-foreground mb-6">
            Care Guide
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Keep your VEIL case looking pristine with our care recommendations.
          </p>
        </div>
      </section>

      {/* General Care */}
      <section className="py-20 container-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-md font-light text-foreground text-center mb-12">
            General Care Tips
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {careInstructions.map((item) => (
              <div key={item.title} className="bg-secondary p-6 rounded-lg text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-body-lg font-medium text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material-Specific Guides */}
      <section className="py-20 bg-secondary">
        <div className="container-padding max-w-4xl mx-auto">
          <h2 className="text-display-md font-light text-foreground text-center mb-12">
            Material-Specific Care
          </h2>
          <div className="space-y-6">
            {materialGuides.map((guide) => (
              <div key={guide.material} className="bg-background p-6 rounded-lg">
                <h3 className="text-body-lg font-medium text-foreground mb-4">
                  {guide.material}
                </h3>
                <ul className="space-y-2">
                  {guide.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 container-padding">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-display-md font-light text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-secondary rounded-lg px-6 border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
};

export default CareGuide;
