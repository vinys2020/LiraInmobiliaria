// src/components/NormalizeTrailingSlash.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function NormalizeTrailingSlash() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      location.pathname.length > 1 &&
      location.pathname.endsWith("/")
    ) {
      navigate(location.pathname.slice(0, -1) + location.search, { replace: true });
    }
  }, [location, navigate]);

  return null;
}
