import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isUserAuthenticated = await isAuthenticated(); // Replace with actual authentication check

  if(!isUserAuthenticated) redirect('/sign-in');
  return (
    <>          
      <div className="flex mx-auto max-w-7xl flex-col gap-8 pt-6 px-6">
        <nav>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={38} height={32} />
            <h2 className="text-primary-100">prepWise</h2>
          </Link>
        </nav>

        {children}
      </div>
    </>
  );
}