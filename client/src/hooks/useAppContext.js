import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export function useAppContext() {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error("useAppContext must be used inside AppContext.");
  }

  return value;
}
