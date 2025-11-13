import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { getDiligenceFabricSDK } from "../services/DFService";

interface MenuItem {
  AppMenuID: number;
  AppMenuLabel: string;
  AppMenuURL?: string;
  ParenAppMenuID: number;
  children?: MenuItem[];
}

export default function Sidebar() {
  const location = useLocation();
  const [nested, setNested] = useState<MenuItem[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetch = async () => {
      const client = getDiligenceFabricSDK();
      const raw = await client.getApplicationRoleService().getAllAccessibleMenus();
      const tree = buildTree(raw);
      setNested(tree);
    };
    fetch();
  }, []);

  const buildTree = (items: any[]): MenuItem[] => {
    const map: Record<number, MenuItem> = {};
    const roots: MenuItem[] = [];
    items.forEach((i) => (map[i.AppMenuID] = { ...i, children: [] }));
    items.forEach((i) => {
      if (i.ParenAppMenuID === 0) roots.push(map[i.AppMenuID]);
      else if (map[i.ParenAppMenuID]) map[i.ParenAppMenuID].children!.push(map[i.AppMenuID]);
    });
    return roots;
  };

  const toggle = (id: number) => setOpenMenus((p) => ({ ...p, [id]: !p[id] }));

  // Normalize API url to router path: return '/myclaims' or external url unchanged
  const normalizeUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // ensure leading slash
    return url.startsWith("/") ? url : `/${url}`;
  };

  const renderItem = (item: MenuItem): JSX.Element => {
    const hasChildren = !!(item.children && item.children.length);
    const isOpen = openMenus[item.AppMenuID];
    const target = normalizeUrl(item.AppMenuURL);

    return (
      <div key={item.AppMenuID} className="mb-1">
        <div
          className={`flex items-center dark:hover:text-black dark:text-white justify-between p-2 rounded cursor-pointer ml-2 transition-all duration-150
            ${location.pathname === target ? "bg-primary-50 text-primary-700 font-semibold" : "hover:bg-gray-100 text-gray-800"}`}
        >
          <div className="flex-1">
            {target ? (
              // external link
              (target.startsWith("http") ? (
                <a href={target} target="_blank" rel="noreferrer" className="block">
                  <span className="font-medium">{item.AppMenuLabel}</span>
                </a>
              ) : (
                // internal route link
                <NavLink to={target} className="block font-medium">
                  {item.AppMenuLabel}
                </NavLink>
              ))
            ) : (
              // no url — act as toggle label
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
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav>{nested.map(renderItem)}</nav>
    </aside>
  );
}