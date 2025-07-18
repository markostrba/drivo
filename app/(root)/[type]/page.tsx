import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Models } from "node-appwrite";
import { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
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

  const sort = ((await searchParams)?.sort as string) || "";
  const search = ((await searchParams)?.query as string) || "";

  const result = await getFiles({
    currentUserId: user?.$id,
    currentUserEmail: user?.email,
    type: getFileTypesParams(type),
    searchText: search,
    sort,
  });

  const getTotalSize = (documents?: Models.DocumentList<Models.Document>) => {
    if (!documents) return "0 B";
    return convertFileSize(
      documents.documents.reduce((acc, doc) => acc + doc.size, 0),
    );
  };

  return (
    <div className="flex flex-col gap-9 pr-[40px] pb-[58px] pl-[37px] md:pt-[34px]">
      {result.success ? (
        <>
          <section className="text-light-1">
            <h1 className="h1 mb-2.5">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h1>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="body-1">
                Total: <span className="h5">{getTotalSize(result.data)}</span>
              </div>
              <Sort />
            </div>
          </section>

          {result.data?.total ? (
            <section className="grid w-full gap-6.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.data.documents.map((file) => (
                <Card key={file.$id} file={file} userId={user.$id} />
              ))}
            </section>
          ) : (
            <p className="body-1 text-light-2 mt-45 text-center">
              No Files Uploaded
            </p>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-red-500">
          <h2 className="text-xl font-semibold">Error loading files</h2>
          <p>{result?.error?.message || "Please try again later."}</p>
        </div>
      )}
    </div>
  );
};

export default Page;
