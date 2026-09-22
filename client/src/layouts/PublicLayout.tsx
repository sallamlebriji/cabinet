import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useLenis } from "../hooks/useLenis";

export function PublicLayout() {
  useLenis();

  return (
    <div className="paper-bg min-h-screen text-ink">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
