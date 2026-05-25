import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
