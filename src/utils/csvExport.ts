// CSV Export Utility Functions

interface Order {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
  transaction_id: string | null;
  created_at: string;
  items: any;
  shipping_address: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  in_stock: boolean;
}

// Format price - orders are stored in rupees, not paise
const formatPriceRupees = (priceInRupees: number): string => {
  return priceInRupees.toFixed(2);
};

// Format price for products - stored in paise
const formatPricePaise = (priceInPaise: number): string => {
  return (priceInPaise / 100).toFixed(2);
};
const escapeCSV = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportOrdersToCSV = (orders: Order[]): void => {
  const headers = [
    "Order Number",
    "Date",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "Postal Code",
    "Items",
    "Subtotal (₹)",
    "Tax (₹)",
    "Shipping (₹)",
    "Total (₹)",
    "Payment Status",
    "Order Status",
    "Transaction ID",
  ];

  const rows = orders.map((order) => {
    const address = order.shipping_address as any;
    const items = (order.items as any[]) || [];
    const itemsStr = items.map((i) => `${i.name} x${i.quantity}`).join("; ");

    return [
      escapeCSV(order.order_number),
      escapeCSV(new Date(order.created_at).toLocaleDateString()),
      escapeCSV(address?.fullName || ""),
      escapeCSV(address?.email || ""),
      escapeCSV(address?.phone || ""),
      escapeCSV(address?.address || ""),
      escapeCSV(address?.city || ""),
      escapeCSV(address?.state || ""),
      escapeCSV(address?.postalCode || ""),
      escapeCSV(itemsStr),
      escapeCSV(formatPriceRupees(order.total * 0.82)), // Approx subtotal (values in rupees)
      escapeCSV(formatPriceRupees(order.total * 0.18)), // Approx tax (values in rupees)
      escapeCSV("0"),
      escapeCSV(formatPriceRupees(order.total)), // Total in rupees
      escapeCSV(order.payment_status),
      escapeCSV(order.order_status),
      escapeCSV(order.transaction_id || "N/A"),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadCSV(csvContent, `veil-orders-${new Date().toISOString().split("T")[0]}.csv`);
};

export const exportInventoryToCSV = (products: Product[]): void => {
  const headers = [
    "Product ID",
    "Product Name",
    "Price (₹)",
    "Stock Quantity",
    "Stock Status",
    "Low Stock Alert",
  ];

  const rows = products.map((product) => {
    const isLowStock = product.stock_quantity < 5;
    const isWarning = product.stock_quantity >= 5 && product.stock_quantity < 15;

    return [
      escapeCSV(product.id),
      escapeCSV(product.name),
      escapeCSV(formatPricePaise(product.price)), // Products are in paise
      escapeCSV(product.stock_quantity),
      escapeCSV(product.in_stock ? "In Stock" : "Out of Stock"),
      escapeCSV(isLowStock ? "CRITICAL" : isWarning ? "WARNING" : "OK"),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadCSV(csvContent, `veil-inventory-${new Date().toISOString().split("T")[0]}.csv`);
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
