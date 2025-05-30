import { createBrowserRouter, Outlet } from "react-router-dom";

import IgntHeader from "../components/IgntHeader";
import DataView from "../views/DataView";
import PortfolioView from "../views/PortfolioView";
import WalletView from "../views/WalletView"; // 🆕 Import WalletView

const items = [
  {
    label: "Portfolio",
    to: "/",
  },
  {
    label: "Wallet", // 🆕 Add Wallet tab
    to: "/wallet",
  },
  {
    label: "Data",
    to: "/data",
  },
];

const Layout = () => {
  return (
    <>
      <IgntHeader navItems={items} />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <PortfolioView /> },
      { path: "/wallet", element: <WalletView /> }, // 🆕 Add wallet route
      { path: "/data", element: <DataView /> },
    ],
  },
]);

export default router;