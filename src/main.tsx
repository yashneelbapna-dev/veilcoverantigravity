import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import { WishlistProvider } from "./contexts/WishlistContext";

function dismissStaticHero() {
  const hero = document.getElementById('static-hero');
  if (hero) hero.remove();
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <WishlistProvider>
      <CartProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </CartProvider>
    </WishlistProvider>
  </AuthProvider>
);

// Remove static hero once React has rendered
requestAnimationFrame(() => {
  setTimeout(dismissStaticHero, 50);
});
