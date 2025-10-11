"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/useAuth";

export default function Logout() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut();
      router.push("/account/signin");
    };
    
    handleLogout();
  }, [router, signOut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-sign-out-alt text-white text-2xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing Out</h1>
        <p className="text-gray-600 mb-6">You are being logged out...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
      </div>
    </div>
  );
}