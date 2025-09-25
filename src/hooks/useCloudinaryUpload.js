import { useState } from "react";

export function useCloudinaryUpload() {
  const [loading, setLoading] = useState(false);

  // ✅ Configuración de tus dos cuentas de Cloudinary
  const accounts = [
    { cloudName: "dcggcw8df", uploadPreset: "preset_principal" }, // primer cuenta
    { cloudName: "dqesszxgv", uploadPreset: "preset_secundario" }, // segunda cuenta
  ];

  const uploadFiles = async (files) => {
    setLoading(true);
    try {
      const urls = [];

      for (const file of files) {
        let uploaded = null;

        for (const account of accounts) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", account.uploadPreset);

            const res = await fetch(
              `https://api.cloudinary.com/v1_1/${account.cloudName}/image/upload`,
              { method: "POST", body: formData }
            );

            if (!res.ok) throw new Error("Error al subir");

            const data = await res.json();
            uploaded = data.secure_url;
            break; // ✅ si funcionó, salir del loop
          } catch (error) {
            console.warn(
              `❌ Falló la subida en ${account.cloudName}, probando siguiente cuenta...`
            );
          }
        }

        if (uploaded) {
          urls.push(uploaded);
        } else {
          console.error("No se pudo subir el archivo en ninguna cuenta.");
        }
      }

      return urls;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFiles, loading };
}
