import Sort from "@/components/Sort";
import { getFileAnalytics, getFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import FileList from "@/components/FileList";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/app/getQueryProvider";
import ErrorToast from "@/components/ErrorToast";
import { Models } from "node-appwrite";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const type = (await params).type || "Files";
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1);

  return {
    title: `${capitalized} - Drivo`,
  };
}

const BATCH_SIZE = 12;

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { data: user } = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const type = (await params).type;
  if (!getFileTypesParams(type).length) {
    notFound();
  }

  const sort = ((await searchParams)?.sort as string) || "$createdAt-desc";
  const search = ((await searchParams)?.query as string) || "";
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["files"],
    queryFn: async ({ pageParam = null }) => {
      const { error, data: fileDocuments } = await getFiles({
        currentUserId: user.$id,
        currentUserEmail: user.email,
        type: getFileTypesParams(type),
        searchText: search,
        sort,
        limit: BATCH_SIZE,
        cursorAfter: pageParam ?? undefined,
      });

      if (error) {
        throw new Error(error.message);
      }

      return fileDocuments;
    },
    getNextPageParam: (
      lastPage: Models.DocumentList<Models.Document> | undefined,
    ) => {
      const docs = lastPage?.documents ?? [];
      if (docs.length < BATCH_SIZE) return undefined;
      return docs[docs.length - 1].$id;
    },
    initialPageParam: null as string | null, // <-- FIX HERE
  });

  const { error, data } = await getFileAnalytics({
    userId: user.$id,
    type: getFileTypesParams(type),
  });

  console.log("[PAGE]", { data, type, fileSize: data?.totalUsedSpace });

  return (
    <div className="flex flex-col gap-9 md:pt-[34px] md:pr-[40px] md:pb-[58px] md:pl-[37px]">
      <>
        <section className="text-light-1">
          <h1 className="h1 mb-2.5">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h1>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="body-1">
              Total:
              <span className="h5 ml-1">
                {data && convertFileSize(data?.totalUsedSpace)}
              </span>
            </div>
            <Sort />
          </div>
        </section>

        <section className="grid w-full gap-6.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <FileList
              currentUserId={user.$id}
              currentUserEmail={user.email}
              type={getFileTypesParams(type)}
              searchText={search}
              sort={sort}
              key={user.$id}
            />
          </HydrationBoundary>
        </section>
      </>
      <ErrorToast error={error} title="Something went wrong" />
    </div>
  );
};

export default Page;
