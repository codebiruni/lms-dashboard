/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import LogedUser from "../functions/LogedUser";

type ContextValue = {
  test: string;
  handleTest: (data: string) => void;
  UserData?: any;
  profile?: any;
  handleUser: any;
  handleLogout?: any;
  handleProfile?: any;
  callLogout?: boolean;
};

export const ContextData = createContext<ContextValue | undefined>(undefined);

type ContextProviderProps = {
  children: ReactNode;
};

export default function AuthContext({ children }: ContextProviderProps) {
  const [test, setTest] = useState<string>("hello world");
  const [UserData, setUserData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [callLogout, setCallLogout] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userinfo: any = await LogedUser();
        setUserData(userinfo);
        
      } catch (error) {
        console.error("Failed to load user:", error);
        setUserData(null);
      }
    };

    fetchUser();
  }, []);

  const handleUser = (data: any) => {
    setUserData(data);
  };

  const handleLogout = (data: boolean) => {
    setCallLogout(data);
  };

  const handleProfile = (data: string) => {
    setProfile(data);
  };

  const handleTest = (data: string) => {
    setTest(data);
  };

  const value: ContextValue = {
    test,
    handleTest,
    UserData,
    handleUser,
    handleLogout,
    callLogout,
    profile,
    handleProfile
  };

  return <ContextData.Provider value={value}>{children}</ContextData.Provider>;
}
