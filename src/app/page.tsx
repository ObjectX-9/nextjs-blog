import { lazy } from "react";

const HomePageClient = lazy(() => import("@/components/HomePage/HomePageClient"));

export default async function App() {

  return (
    <HomePageClient/>
  );
}
