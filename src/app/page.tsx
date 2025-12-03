import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import LandingPage from "@/components/LandingPage/LandingPage";
import HomeClient from "@/components/Home/HomeClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <LandingPage />;
  }

  return <HomeClient />;
}
