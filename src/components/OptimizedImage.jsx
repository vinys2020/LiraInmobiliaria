// src/components/OptimizedImage.jsx
import React from "react";
import { buildCloudinaryUrlWithTransform } from "../utils/cloudinary";

export default function OptimizedImage({
  src,
  alt = "",
  defaultWidth = 1000,
  widths = [400, 800, 1000, 1600],
  className = "",
  ...props
}) {
  if (!src) return null;
  // URL principal optimizada
  const optimizedSrc = buildCloudinaryUrlWithTransform(src, defaultWidth);

  // srcSet para que el navegador descargue la versión adecuada
  const srcSet = widths
    .map((w) => `${buildCloudinaryUrlWithTransform(src, w)} ${w}w`)
    .join(", ");

  // sizes: ajustalo según tu layout
  const sizes = "(max-width: 600px) 100vw, 1000px";

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      loading="lazy"
      alt={alt}
      className={className}
      {...props}
    />
  );
}
