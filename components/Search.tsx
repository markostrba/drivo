"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { getFiles } from "@/lib/actions/file.action";
import { toast } from "sonner";
import { Models } from "appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { Skeleton } from "./ui/skeleton";

const Search = ({
  ownerId,
  userEmail,
}: {
  ownerId: string;
  userEmail: string;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Models.Document[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const router = useRouter();
  const pathname = usePathname();
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        console.log(debouncedQuery);
        setResults([]);
        setIsOpen(false);
        return router.push(pathname.replace(searchParams.toString(), ""));
      }
      setIsLoading(true);

      const { error, data } = await getFiles({
        currentUserId: ownerId,
        currentUserEmail: userEmail,
        type: [],
        searchText: debouncedQuery,
      });

      if (error) {
        toast.error("Failed to load searched files", {
          description: error.message,
        });
      }
      setIsLoading(false);
      setResults(data?.documents!);
      setIsOpen(true);
    };

    fetchFiles();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const handleClickItem = (file: Models.Document) => {
    setIsOpen(false);
    setResults([]);

    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`,
    );
  };

  return (
    <div className="!shadow-3 relative max-w-[482px] flex-1  gap-[7px] rounded-[30px] px-4">
      <div className="flex items-center h-[52px]">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={20}
          height={20}
        />
        <Input
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          className="shad-no-focus! subtitle-2 text-light-1 border-none shadow-none!"
        />
      </div>
      {isOpen && (
        <ul className="absolute left-0 top-16 z-50 flex w-full flex-col gap-3 rounded-[30px] bg-white p-4">
          {isLoading ? (
            <div className="w-full flex gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 flex-1 !rounded-3xl" />
            </div>
          ) : results.length ? (
            results.map((file) => (
              <li
                className="flex items-center justify-between"
                key={file.$id}
                onClick={() => handleClickItem(file)}
              >
                <div className="flex cursor-pointer items-center gap-4">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9"
                  />
                  <p className="subtitle-2 line-clamp-1 text-light-1">
                    {file.name}
                  </p>
                </div>

                <FormattedDateTime
                  date={file.$createdAt}
                  className="caption line-clamp-1 text-light-2"
                />
              </li>
            ))
          ) : (
            <p className="body-2 text-center text-light-1">No files found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
