"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import NavLinks from "./NavLinks";
import { User } from "@/types/global";
import HamburgerIcon from "./ui/hamburgerIcon";
import { ChevronLeft, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { Skeleton } from "./ui/skeleton";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import Link from "next/link";

const MobileNavigation = ({
  email,
  fullName,
  avatar,
  accountId,
  $id: ownerId,
}: Pick<User, "email" | "fullName" | "avatar" | "accountId" | "$id">) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, setResults } =
    useSearch({
      ownerId,
      userEmail: email,
    });

  console.log(fullName);

  const handleClickItem = () => {
    setIsOpen(false);
    setIsSearchOpen(false);
    setResults([]);

    setQuery("");
  };

  return (
    <header className="flex min-h-[110px] w-full items-center justify-between border-b bg-[#F2F4F8] px-5 py-3 sm:hidden">
      {isSearchOpen ? (
        <div className="fixed bottom-0 left-0 z-50 h-screen w-full bg-white">
          <div className="flex items-center justify-center pr-3 pl-2">
            <ChevronLeft size={25} onClick={() => setIsSearchOpen(false)} />
            <input
              type="text"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              style={{ caretColor: "#fa7275" }}
              className="shad-no-focus text-light-1 subtitle-2 flex-1 p-4"
            />
            {query && <X size={25} onClick={() => setQuery("")} />}
          </div>
          {isOpen && (
            <ul className="flex w-full flex-col gap-5 p-4">
              {isLoading ? (
                <div className="flex w-full gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-12 flex-1 !rounded-3xl" />
                </div>
              ) : results.length ? (
                results.map((file) => (
                  <li className="" key={file.$id}>
                    <Link
                      onClick={handleClickItem}
                      href={`/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`}
                      className="flex gap-2"
                    >
                      <Thumbnail
                        type={file.type}
                        extension={file.extension}
                        url={file.url}
                        className="size-11 min-w-11"
                      />
                      <div className="flex flex-col items-start justify-start gap-0.5">
                        <p className="subtitle-2 text-light-1 line-clamp-1 !text-[12px]">
                          {file.name}
                        </p>
                        <FormattedDateTime
                          date={file.$createdAt}
                          className="caption text-light-2 line-clamp-1"
                        />
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <p className="body-2 text-light-1 text-center">
                  No files found
                </p>
              )}
            </ul>
          )}
        </div>
      ) : (
        <div className="!shadow-1 flex w-full items-center gap-2 rounded-full bg-[#F2F4F8] px-5 py-3">
          <Sheet>
            <SheetTrigger>
              <HamburgerIcon />
            </SheetTrigger>
            <SheetContent className="h-screen px-3 pt-8" side="left">
              <NavLinks isMobileNav className="justify-start" />
              <div className="flex flex-col justify-between gap-5 pb-5">
                <FileUploader
                  accountId={accountId}
                  ownerId={ownerId}
                  className="w-full"
                />
                <Button
                  type="submit"
                  className="h5 bg-brand/10 text-brand hover:bg-brand/20 flex h-[52px] w-full items-center gap-4 rounded-full px-6 shadow-none transition-all"
                  onClick={async () => {}}
                >
                  <Image
                    src="/assets/icons/logout.svg"
                    alt="logo"
                    width={24}
                    height={24}
                  />
                  <p>Logout</p>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <button
            className="body-2 text-light-1 flex-1 text-left"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            Search...
          </button>

          <Image
            src={avatar}
            width={30}
            height={30}
            className="rounded-full"
            alt="avatar"
          />
        </div>
      )}
    </header>
  );
};

export default MobileNavigation;
