"use client";
import { useContext } from "react";
import { ContextData } from "../utils/auth-context";

export default function useContextData() {
  const context = useContext(ContextData);
  if (!context) {
    throw new Error(
      "useContextData must be used within a ContextData.Provider"
    );
  }
  const { test, handleTest, UserData, handleUser, handleLogout, callLogout, profile,
    handleProfile } =
    context;
  return {
    test,
    handleTest,
    UserData,
    handleUser,
    handleLogout,
    callLogout,
    profile,
    handleProfile
  };
}
