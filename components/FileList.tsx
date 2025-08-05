"use client";

import { getFiles } from "@/lib/actions/file.action";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import Card from "./Card";
import { toast } from "sonner";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

const BATCH_SIZE = 12;

type FileListProps = {
  currentUserId: string;
  currentUserEmail: string;
  type: string[];
  searchText: string;
  sort: string | undefined;
};

const FileList = ({
  currentUserId,
  currentUserEmail,
  type,
  searchText,
  sort,
}: FileListProps) => {
  const { ref, inView } = useInView();

  const { data, error, fetchNextPage, hasNextPage, isRefetching } =
    useInfiniteQuery({
      queryKey: ["files"],
      queryFn: async ({ pageParam = null }) => {
        const { error, data: fileDocuments } = await getFiles({
          currentUserId,
          currentUserEmail,
          type,
          searchText,
          sort,
          limit: BATCH_SIZE,
          cursorAfter: pageParam ?? undefined,
        });

        if (error) {
          toast.error("Failed to fetch files", { description: error.message });
          throw new Error(error.message);
        }

        return fileDocuments;
      },
      getNextPageParam: (lastPage) => {
        const docs = lastPage?.documents ?? [];
        if (docs.length < BATCH_SIZE) return undefined;
        return docs[docs.length - 1].$id;
      },
      initialPageParam: null as string | null, // <-- FIX HERE
    });

  // Auto-fetch next page when sentinel comes into view
  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const allFiles = data?.pages.flatMap((page) => page?.documents || []) ?? [];

  return (
    <>
      {allFiles.map((file) => (
        <Card key={file.$id} file={file} userId={currentUserId} />
      ))}

      {(hasNextPage || isRefetching) && (
        <>
          <Skeleton className="h-[216px] rounded-[18px] bg-black/5" ref={ref} />
          <Skeleton className="h-[216px] rounded-[18px] bg-black/5" />
          <Skeleton className="h-[216px] rounded-[18px] bg-black/5 sm:hidden xl:block" />
          <Skeleton className="hidden h-[216px] rounded-[18px] bg-black/5 2xl:block" />
        </>
      )}

      {error && (
        <p className="text-center text-red-500">Failed to load files.</p>
      )}
    </>
  );
};

export default FileList;
