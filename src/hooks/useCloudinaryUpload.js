import { useState } from "react";

export function useCloudinaryUpload() {
  const [loading, setLoading] = useState(false);

  // ✅ Configuración de la nueva cuenta
  const cloudName = "dxdnsblj6"; 
  const uploadPreset = "preset_trip"; // ⚠️ poné acá el nombre del preset que tengas configurado en esa cuenta

  const uploadFiles = async (files) => {
    setLoading(true);
    try {
      const urls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Error al subir");

        const data = await res.json();
        urls.push(data.secure_url);
      }

      return urls;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFiles, loading };
}
