import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
}

interface MenuCategory {
  name: string;
  href?: string;
  items?: MenuItem[];
  isGreen?: boolean;
}

const menuCategories: MenuCategory[] = [
  {
    name: "Tech",
    items: [
      { name: "Phone Cases", href: "/tech/phone-cases" },
      { name: "Watch Accessories", href: "/tech/watch-accessories" },
      { name: "Charging Solutions", href: "/tech/charging-solutions" },
      { name: "Laptop Sleeves & Bags", href: "/tech/laptop-sleeves" },
      { name: "Tech Add-ons", href: "/tech/tech-addons" },
    ],
  },
  {
    name: "Work Essentials",
    isGreen: true,
    items: [
      { name: "Stands", href: "/work-essentials/stands" },
      { name: "Charging Collections", href: "/work-essentials/charging" },
      { name: "Organisers", href: "/work-essentials/organisers" },
      { name: "Stationery", href: "/work-essentials/stationery" },
    ],
  },
  {
    name: "Shop by Apple",
    items: [
      { name: "iPhone", href: "/apple/iphone" },
      { name: "MacBook", href: "/apple/macbook" },
      { name: "AirPods", href: "/apple/airpods" },
      { name: "MagSafe", href: "/apple/magsafe" },
      { name: "iPad", href: "/apple/ipad" },
      { name: "Apple Watch", href: "/apple/apple-watch" },
    ],
  },
  {
    name: "New Arrivals",
    href: "/new-arrivals",
  },
];

const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="hidden md:flex items-center gap-1">
      {menuCategories.map((category) => (
        <div
          key={category.name}
          className="relative"
          onMouseEnter={() => category.items && setActiveMenu(category.name)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          {category.items ? (
            <>
              <button
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  category.isGreen 
                    ? "text-green-500 hover:text-green-400" 
                    : "text-muted-foreground"
                }`}
              >
                {category.name}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  activeMenu === category.name ? "rotate-180" : ""
                }`} />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute left-0 top-full pt-2 transition-all duration-200 ${
                  activeMenu === category.name
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
              >
                <div className="min-w-[220px] rounded-xl border border-primary/20 bg-card p-4 shadow-xl">
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link
              to={category.href!}
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default MegaMenu;
