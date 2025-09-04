import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ImagenesCuadricula = ({ propiedad }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!propiedad?.imagenes || propiedad.imagenes.length === 0) return null;

  return (
    <div className="row justify-content-center g-3 mb-5">
      {/* Primera imagen grande */}
      <div className="col-12 col-md-6">
        <img
          src={propiedad.imagenes[0]}
          alt={`${propiedad.titulo} 1`}
          className="img-fluid rounded-3 shadow-sm propiedad-img"
          style={{ height: "350px", objectFit: "cover", width: "100%", cursor: "pointer" }}
          onClick={() => { setIndex(0); setOpen(true); }}
        />
      </div>

      {/* Cuatro imágenes pequeñas a la derecha */}
      <div className="col-12 col-md-6">
        <div className="row g-3">
          {propiedad.imagenes.slice(1, 5).map((img, i) => (
            <div key={i} className="col-6">
              <img
                src={img}
                alt={`${propiedad.titulo} ${i + 2}`}
                className="img-fluid rounded-3 shadow-sm propiedad-img"
                style={{ height: "170px", objectFit: "cover", width: "100%", cursor: "pointer" }}
                onClick={() => { setIndex(i + 1); setOpen(true); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={propiedad.imagenes.map((img) => ({ src: img }))}
          index={index}
          render={{ slide: ({ slide }) => <img src={slide.src} alt="" /> }}
        />
      )}
    </div>
  );
};

export default ImagenesCuadricula;
