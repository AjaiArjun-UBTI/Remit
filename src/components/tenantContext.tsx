// TenantContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { getDiligenceFabricSDK } from "../services/DFService"; // frontend SDK


interface SessionData {
  tenantId: string | null;
  userId: string | null;
}

const SessionContext = createContext<SessionData>({ tenantId: null, userId: null });

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionData>({ tenantId: null, userId: null });

useEffect(() => {
  (async () => {
    try {
      console.log("tenantContext: using client SDK");
      const client = await getDiligenceFabricSDK();
      const roleService = client.getApplicationRoleService();
      const tenantId = (roleService as any)?.tenantId ?? null;
      const userId = (roleService as any)?.userId ?? null;
      setSession({ tenantId, userId });
    } catch (err) {
      console.error("tenantContext: SDK error", err);
      setSession({ tenantId: null, userId: null });
    }
  })();
}, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);