import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const guardarRecibo = async (datosRecibo) => {
    try {
        await addDoc(collection(db, "Recibos"), {
            ...datosRecibo,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error guardando recibo:", error);
    }
};