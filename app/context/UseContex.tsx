"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext<any>(null);

export const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [user, setUser] = useState<any>(null); // Use `any` if the structure is uncertain or can vary

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        console.log({ data });

        setUser(data.user.employee); // Storing employee data as user content
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={user}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
