
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, db } from "../config/firebase";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AuthContext = createContext();

const adminUIDs = [
  "qDjml8VBzpRevo2OKQ6ghkiyn1e2",
  "FUowDJVLPlc6silGDH3RJ2qNmqN2",
  "DJBq2RqI6bT0cWYVLUlIaIOPHma2",
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const obtenerDatosUsuario = async (currentUser) => {
    try {
      console.log("BUSCANDO USUARIO");
      console.log("UID:", currentUser.uid);
      console.log("EMAIL:", currentUser.email);

      // ==========================================
      // ADMIN
      // ==========================================
      if (adminUIDs.includes(currentUser.uid)) {
        console.log("USUARIO ADMIN");

        return {
          rol: "admin",
          clienteId: null,
        };
      }

      // ==========================================
      // USUARIOS / CLIENTES / EMPLEADOS
      // Buscar por EMAIL
      // ==========================================
      const usuariosRef = collection(db, "Usuarios");

      const q = query(
        usuariosRef,
        where("email", "==", currentUser.email)
      );

      const snapshot = await getDocs(q);

      console.log(
        "USUARIOS ENCONTRADOS:",
        snapshot.size
      );

      if (!snapshot.empty) {
        const documento = snapshot.docs[0];
        const datos = documento.data();

        console.log(
          "DOCUMENTO USUARIO:",
          documento.id
        );

        console.log(
          "DATOS USUARIO:",
          datos
        );

        return {
          rol: datos.rol || null,
          clienteId: datos.clienteId || null,
        };
      }

      console.log(
        "NO SE ENCONTRO USUARIO CON ESE EMAIL"
      );

      return {
        rol: null,
        clienteId: null,
      };

    } catch (error) {
      console.error(
        "ERROR BUSCANDO USUARIO EN FIRESTORE:",
        error
      );

      return {
        rol: null,
        clienteId: null,
      };
    }
  };

  const login = async (email, password) => {
    const userCred = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const currentUser = userCred.user;

    const datosUsuario =
      await obtenerDatosUsuario(currentUser);

    setUser(currentUser);
    setRol(datosUsuario.rol);
    setClienteId(datosUsuario.clienteId);

    console.log("DATOS FINALES DEL LOGIN");
    console.log("ROL:", datosUsuario.rol);
    console.log("CLIENTE ID:", datosUsuario.clienteId);

    return {
      user: currentUser,
      rol: datosUsuario.rol,
      clienteId: datosUsuario.clienteId,
    };
  };

  const logout = async () => {
    await signOut(auth);

    setUser(null);
    setRol(null);
    setClienteId(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (currentUser) {
            const datosUsuario =
              await obtenerDatosUsuario(currentUser);

            setUser(currentUser);
            setRol(datosUsuario.rol);
            setClienteId(datosUsuario.clienteId);
          } else {
            setUser(null);
            setRol(null);
            setClienteId(null);
          }
        } catch (error) {
          console.error(
            "ERROR EN ESTADO DE AUTENTICACION:",
            error
          );

          setUser(null);
          setRol(null);
          setClienteId(null);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        rol,
        clienteId,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

