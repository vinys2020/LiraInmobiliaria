import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // tu config de firebase

const usePropiedades = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Propiedades"));
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPropiedades(docs);
      } catch (error) {
        console.error("Error al traer propiedades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropiedades();
  }, []);

  return { propiedades, loading };
};

export default usePropiedades;
