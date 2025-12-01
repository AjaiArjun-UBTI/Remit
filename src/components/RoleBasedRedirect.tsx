// components/RoleBasedRedirect.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDiligenceFabricSDK } from "../services/DFService";

interface LocalData {
  TenantID: number;
  UserID: number;
  Roles: string;
  // other fields...
}

export default function RoleBasedRedirect() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveAndRedirect = async () => {
      try {
        const rawData = sessionStorage.getItem("userData");
        const appIdData = sessionStorage.getItem("appEnvironmentCODE");

        if (!rawData || !appIdData) {
          navigate("/login", { replace: true });
          return;
        }

        const sessionData: LocalData = JSON.parse(rawData);
        const appEnvironmentCODE: string = JSON.parse(appIdData);

        const payload = {
          appId: 298,
          tenantID: sessionData.TenantID,
          userId: sessionData.UserID,
          appEnvironmentCODE,
        };

        const client = getDiligenceFabricSDK();
        const response = await client.getApplicationRoleService().getUserAppRole(payload);

        let roleData: any;

        if (sessionData.Roles === "ORGADM") {
          roleData = response?.Result?.find(
            (item: any) => item.TenantID === sessionData.TenantID && item.UserID === sessionData.UserID
          );
        } else {
          roleData = response?.Result?.[0];
        }

        let targetRoute = "/userdashboard"; // default fallback

        if (roleData && roleData.AppRoles) {
          const appRoles = JSON.parse(roleData.AppRoles);
          const userRoles: string[] = appRoles.map((r: any) => r.AppRoleName);
          const primaryRole = userRoles[0]; // or use logic to pick correct one

          console.log("Resolved primary role:", primaryRole);

          // Customize this mapping based on your actual role names
          if (primaryRole === "Approver") {
            targetRoute = "/approverdashboard";
          } else if (primaryRole === "Admin") {
            targetRoute = "/admindashboard";
          }
          else if (primaryRole === "User") {
            targetRoute = "/userdashboard";
          }
          // Add more roles as needed
        }

        navigate(targetRoute, { replace: true });
      } catch (error) {
        console.error("Failed to resolve user role for redirect:", error);
        // Fallback: send to user dashboard or login
        navigate("/userdashboard", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    resolveAndRedirect();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return null; // Will never be shown due to redirect
}