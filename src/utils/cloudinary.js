export function buildCloudinaryUrlWithTransform(url, width = 1000) {
    if (!url || !url.includes("res.cloudinary.com")) return url;
  
    const transform = `f_auto,q_auto,w_${width}`;
  
    // Si la URL ya tiene la versión (v12345) cualquiera sea el contenido entre upload/ y v,
    // reemplazamos lo que haya entre /upload/ y v... por nuestra transformación.
    if (/\/upload\/.*v\d+\//.test(url)) {
      return url.replace(/\/upload\/.*?(v\d+\/)/, `/upload/${transform}/$1`);
    }
  
    // Fallback si no hay version en la URL.
    return url.replace("/upload/", `/upload/${transform}/`);
  }
  