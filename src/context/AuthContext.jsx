import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

// UID del admin por defecto (puede quedar como respaldo)
const adminUID = "qDjml8VBzpRevo2OKQ6ghkiyn1e2";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null); // "admin" | "empleado" | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Login con email y password
  const login = async (email, password) => {
    setError(null);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCred.user;

      // Obtener rol desde Firestore
      const docRef = doc(db, "usuarios", currentUser.uid);
      const docSnap = await getDoc(docRef);

      let userRole = "empleado"; // valor por defecto
      if (currentUser.uid === adminUID) {
        userRole = "admin";
      } else if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.rol) userRole = data.rol; // rol desde Firestore
      }

      setUser(currentUser);
      setRol(userRole);

      return currentUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRol(null);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Detectar cambios de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Obtener rol desde Firestore
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        let userRole = currentUser.uid === adminUID ? "admin" : "empleado";
        if (docSnap.exists() && docSnap.data().rol) {
          userRole = docSnap.data().rol;
        }

        setRol(userRole);
      } else {
        setRol(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rol, login, logout, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook para usar AuthContext
export const useAuth = () => useContext(AuthContext);
