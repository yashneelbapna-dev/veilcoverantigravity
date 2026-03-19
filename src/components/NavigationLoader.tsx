import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const NavigationLoader = () => {
  const location = useLocation();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      window.scrollTo(0, 0);
      return;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // No overlay — just scroll to top on navigation
  return null;
};

export default NavigationLoader;