import { useEffect, useState } from "react";

const InstagramWarning = () => {
  const [isInstagram, setIsInstagram] = useState(false);

  useEffect(() => {
    if (navigator.userAgent.includes("Instagram")) {
      setIsInstagram(true);
    }
  }, []);

  // No se renderiza nada visual
  return null;
};

export default InstagramWarning;
