import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { getDiligenceFabricSDK } from "../services/DFService";

interface MenuItem {
  AppMenuID: number;
  AppMenuLabel: string;
  AppMenuURL?: string;
  ParenAppMenuID: number;
  children?: MenuItem[];
}

interface NavItem {
    name: string;
    url: string;
}

// interface LocalData {
//   TenantID: number;
//   TenantName: string;
//   TenantCODE: string;
//   AuthenticationTypeCODE: string;
//   Designation: string | null;
//   EmailAddress: string;
//   ExpiresUtc: string;
//   FirstName: string;
//   IsEmailVerified: boolean;
//   IsMeterBillingEnabled: boolean;
//   LastName: string;
//   MiddleName: string;
//   OrganizationIDs: number[];
//   OrganizationName: string;
//   ProductCode: string;
//   ProductID: number;
//   Roles: string;
//   SubscriptionId: string;
//   SubscriptionStatus: string;
//   Token: string;
//   UserID: number;
//   UserName: string;
//   AppProductIds: number[];
// }

export default function Sidebar() {
  const navigate = useNavigate();
  // const [nested, setNested] = useState<MenuItem[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [appMenuItems, setAppMenuItems] = useState<MenuItem[]>([])
  // const [userRole, setUserRole] = useState<string>("");

  // Normalize API url to router path
  const normalizeUrl = (url?: string, label?: string): string => {
    if (!url) {
      // If no URL provided, generate from label
      return `/${label?.toLowerCase().replace(/\s+/g, '')}`;
    }
    
    // If it's an external URL, return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    
    // Ensure it starts with /
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    
    // Remove any trailing slashes
    return cleanUrl.replace(/\/$/, '');
  };

  // Fetch user role
  // useEffect(() => {
  //   const fetchUserRole = async () => {
  //     try {
  //       const rawData = sessionStorage.getItem("userData");
  //       const appIdData = sessionStorage.getItem("appEnvironmentCODE");
  //       if (!rawData || !appIdData) {
  //         throw new Error("Session data not found");
  //       }

  //       const sessionData: LocalData = JSON.parse(rawData);
  //       const appData: string = JSON.parse(appIdData);

  //       const payload = {
  //         appId: 298,
  //         tenantID: sessionData.TenantID,
  //         userId: sessionData.UserID,
  //         appEnvironmentCODE: appData
  //       };

  //       const client = getDiligenceFabricSDK();
  //       const response = await client.getApplicationRoleService().getUserAppRole(payload);
  //       let roleData;

  //       if (sessionData.Roles === "ORGADM") {
  //         roleData = response?.Result?.find(
  //           (item: any) => item.TenantID === sessionData.TenantID && item.UserID === sessionData.UserID
  //         );
  //       } else {
  //         roleData = response?.Result?.[0];
  //       }

  //       if (roleData && roleData.AppRoles) {
  //         const appRoles = JSON.parse(roleData.AppRoles);
  //         const userRoles: string[] = appRoles.map((r: any) => r.AppRoleName);
  //         const firstRole = userRoles?.[0];
  //         setUserRole(firstRole);
  //         console.log("User role:", firstRole);
  //       } else {
  //         console.warn("No matching role data found");
  //         setUserRole("User");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user role:", error);
  //       setUserRole("User");
  //     }
  //   };

  //   fetchUserRole();
  // }, []);

  // Fetch menu items (API returns role-based menus)
  const fetchDataMenu = async () => {
    try {
      const client = getDiligenceFabricSDK();
      const data = JSON.parse(sessionStorage.getItem("userData") || "{}");
      const token = data.Token;
      
      if (!token) {
        console.error("User token not set. Redirecting to login...");
        navigate("/login");
        return;
      }

      const appMenuListResponse = await client
        .getApplicationRoleService()
        .getAllAccessibleMenus();

      console.log('Menu items received (role-based):', appMenuListResponse);

      if (!appMenuListResponse || !Array.isArray(appMenuListResponse)) {
        console.error("Invalid menu response:", appMenuListResponse);
        setAppMenuItems([]);
        return;
      }

      setAppMenuItems(appMenuListResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchDataMenu();
  }, []);

  // Convert appMenuItems to navItems format
  useEffect(() => {
    if (appMenuItems.length > 0) {
      console.log('Converting menu items to nav items...');
      
      const formattedItems = appMenuItems
        .filter((item: MenuItem) => item.ParenAppMenuID === 0)
        .map((item: MenuItem): NavItem => {
          const url = normalizeUrl(item.AppMenuURL, item.AppMenuLabel);
          console.log(`Menu: ${item.AppMenuLabel} -> URL: ${url}`);
          return {
            name: item.AppMenuLabel,
            url: url
          };
        });
      
      console.log('Formatted nav items:', formattedItems);
      setNavItems(formattedItems);
    }
  }, [appMenuItems]);

  // Build tree for hierarchical menu
  // useEffect(() => {
  //   if (appMenuItems.length > 0) {
  //     const tree = buildTree(appMenuItems);
  //     setNested(tree);
  //   }
  // }, [appMenuItems]);

  // const buildTree = (items: any[]): MenuItem[] => {
  //   const map: Record<number, MenuItem> = {};
  //   const roots: MenuItem[] = [];
  //   items.forEach((i) => (map[i.AppMenuID] = { ...i, children: [] }));
  //   items.forEach((i) => {
  //     if (i.ParenAppMenuID === 0) roots.push(map[i.AppMenuID]);
  //     else if (map[i.ParenAppMenuID]) map[i.ParenAppMenuID].children!.push(map[i.AppMenuID]);
  //   });
  //   return roots;
  // };

  const toggle = (id: number) => setOpenMenus((p) => ({ ...p, [id]: !p[id] }));

  const renderItem = (item: MenuItem): JSX.Element => {
    const hasChildren = !!(item.children && item.children.length);
    const isOpen = openMenus[item.AppMenuID];
    const target = normalizeUrl(item.AppMenuURL, item.AppMenuLabel);

    return (
      <div key={item.AppMenuID} className="mb-1">
        <div
          className={`flex items-center dark:hover:text-black dark:text-white justify-between p-2 rounded cursor-pointer ml-2 transition-all duration-150
            `}
        >
          <div className="flex-1">
            {target ? (
              (target.startsWith("http") ? (
                <a href={target} target="_blank" rel="noreferrer" className="block">
                  <span className="font-medium">{item.AppMenuLabel}</span>
                </a>
              ) : (
                <NavLink to={target} className="block font-medium">
                  {item.AppMenuLabel}
                </NavLink>
              ))
            ) : (
              <button onClick={() => hasChildren && toggle(item.AppMenuID)} className="text-left w-full font-medium">
                {item.AppMenuLabel}
              </button>
            )}
          </div>

          {hasChildren && (
            <FaChevronDown
              onClick={(e) => { e.stopPropagation(); toggle(item.AppMenuID); }}
              className={`ml-2 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="ml-6 border-l border-gray-300 pl-2 dark:border-gray-600">
            {item.children!.map(renderItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-52 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 overflow-y-auto">
      <ul className="dashboard-main-nav">
        
        {navItems.length === 0 && (
          <li className="text-gray-400 p-5 text-sm">
            Loading menu items...
          </li>
        )}
        
        {navItems.map((item: NavItem) => {
        return (
          <li key={item.name}>
            <NavLink
              to={item.url}
              className={({ isActive }) => 
                `flex items-center w-full gap-2 p-5 rounded-2xl duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
                ${isActive ? '' : ''}`  // Leave empty or add custom styles if you want
              }
            >
              <span className="text-lg font-[500]">{item.name}</span>    
            </NavLink>
          </li>
        );
      })}
      </ul>
    </aside>
  );
}
