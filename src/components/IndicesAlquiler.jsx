import { useEffect, useState, useRef } from "react";

export default function IndicesAlquiler() {
  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetched = useRef(false);

  useEffect(() => {
    const obtenerIndices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://arquilerapi1.p.rapidapi.com/stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-host": "arquilerapi1.p.rapidapi.com",
              "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || `Error ${response.status}`);
        }

        setIndices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fetched.current) return;
    fetched.current = true;

    obtenerIndices();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando índices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  // 🔥 FUNCION CLAVE: toma el último valor del array
  const getLast = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[0]; // el más reciente viene primero
  };

  const datos = [
    {
      nombre: "ICL",
      data: getLast(indices?.iclRate),
    },
    {
      nombre: "IPC",
      data: getLast(indices?.ipcRate),
    },
    {
      nombre: "RIPTE",
      data: getLast(indices?.ripteRate),
    },
    {
      nombre: "CASA PROPIA",
      data: getLast(indices?.casaPropiaRate),
    },
    {
      nombre: "CÁC",
      data: getLast(indices?.cacRate),
    },
    {
      nombre: "UVA",
      data: getLast(indices?.uvaRate),
    },
  ];

  return (
    <article className="container py-4">


      <div className="row g-3">
        {datos.map((item, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={index}>
            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted text-uppercase fw-bold">
                  {item.nombre}
                </h6>

                <h2 className="fw-bold text-dark">
                  {item.data?.annual_var ?? "N/A"}%
                </h2>

                <small className="text-muted">
                  {item.data?.date ?? ""}
                </small>

              </div>

            </div>
          </div>
        ))}
      </div>


    </article>
  );
}