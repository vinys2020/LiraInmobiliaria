import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { CartContext } from "../context/CartContext";
import "./Productos.css";

const Productos = () => {
  const { categoriaId } = useParams();
  const { agregarAlCarrito } = useContext(CartContext);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      if (!categoriaId) {
        setProductos([]);
        return;
      }
      const productosRef = collection(db, "Categoriasid", categoriaId, "Productosid");
      const q = query(productosRef);
      const snapshot = await getDocs(q);
      const productosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosData);
    };

    fetchProductos();
  }, [categoriaId]);

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <section className="productos-container mt-5">
      <h2 className="productos-titulo mb-4">
        {categoriaId ? `Categoría: ${categoriaId}` : "Productos"}
      </h2>

      <input
        type="text"
        className="productos-buscador form-control mb-4"
        placeholder="Buscar producto por nombre o marca..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="productos-grid row">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <article key={producto.id} className="productos-item col-md-4 mb-4">
              <div className="productos-card card h-100 shadow-sm">
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="productos-img card-img-top"
                  />
                ) : (
                  <div className="productos-sin-img">Sin imagen</div>
                )}
                <div className="productos-info card-body d-flex flex-column">
                  <h5 className="productos-nombre card-title">{producto.nombre}</h5>
                  <p className="productos-marca text-muted mb-2">Marca: {producto.marca}</p>
                  <p className="productos-precio mb-3">
                    Precio: <span className="productos-precio-valor fw-bold">${producto.precio?.toFixed(2)}</span>
                  </p>
                  <button
                    className="productos-boton btn btn-primary mt-auto"
                    disabled={producto.stock === 0}
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p>No hay productos para mostrar.</p>
        )}
      </div>
    </section>
  );
};

export default Productos;
