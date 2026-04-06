// src/context/AuthContext.jsx
// ─── Firebase Auth Context ────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AuthService } from "../services/firebase.services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role,        setRole]        = useState(null);
  const [linkedId,    setLinkedId]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get fresh custom claims
          const tokenResult = await user.getIdTokenResult(true);
          const claims      = tokenResult.claims;
          const userRole    = claims.role    || null;
          const userLinked  = claims.linkedId|| null;

          setCurrentUser(user);
          setRole(userRole);
          setLinkedId(userLinked);

          // Load profile document
          if (userLinked) {
            const profileCol = userRole === "student" ? "students" : "faculty";
            const profileSnap = await getDoc(doc(db, profileCol, userLinked));
            if (profileSnap.exists()) {
              setUserProfile({ id: profileSnap.id, ...profileSnap.data() });
            }
          }
        } catch (err) {
          console.error("Auth state error:", err);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setRole(null);
        setLinkedId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await AuthService.login(email, password);
    setRole(result.role);
    setLinkedId(result.linkedId);
    setUserProfile(result.profile);
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setUserProfile(null);
    setRole(null);
    setLinkedId(null);
  };

  const updateProfile = (data) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const value = {
    currentUser,
    userProfile,
    role,
    linkedId,
    loading,
    isAdmin:   role === "admin",
    isFaculty: role === "faculty" || role === "admin",
    isStudent: role === "student",
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
