import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ smooth = true }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Safari, iOS y todos los navegadores modernos
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  }, [pathname, smooth]);

  return null;
};

export default ScrollToTop;
