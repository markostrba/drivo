"use client";
import React from "react";
import { navItems } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const NavLinks = ({
  isMobileNav = false,
  className,
}: {
  isMobileNav?: boolean;
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <nav className="min-w-[60px] flex-1">
      <ul className="flex flex-col gap-5">
        {navItems.map(({ name, icon, url }) => (
          <Link
            href={url}
            key={name}
            className={cn(
              "h5 text-light-1 flex items-center justify-center gap-4.5 rounded-full px-5 py-5 lg:justify-start",
              pathname === url && "bg-brand !shadow-2 text-white",
              className,
            )}
          >
            <Image
              src={pathname === url ? icon.light : icon.dark}
              alt={name}
              width={26}
              height={26}
            />
            <span className={isMobileNav ? "block" : "hidden lg:block"}>
              {name}
            </span>
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;
