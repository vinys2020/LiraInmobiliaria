import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();
const adminUID = "qDjml8VBzpRevo2OKQ6ghkiyn1e2"; // UID del admin

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const currentUser = userCred.user;

    // Obtener rol
    let userRole = currentUser.uid === adminUID ? "admin" : "empleado";
    const docRef = doc(db, "usuarios", currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().rol) {
      userRole = docSnap.data().rol;
    }

    setUser(currentUser);
    setRol(userRole);
    return currentUser;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRol(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let userRole = currentUser.uid === adminUID ? "admin" : "empleado";
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().rol) {
          userRole = docSnap.data().rol;
        }
        setUser(currentUser);
        setRol(userRole);
      } else {
        setUser(null);
        setRol(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rol, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
