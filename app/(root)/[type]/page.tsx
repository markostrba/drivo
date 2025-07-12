import Card from "@/components/Card";
import { getFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Models } from "node-appwrite";
import React from "react";

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const type = (await params).type || "";
  const search = ((await searchParams)?.query as string) || "";
  const { data: user } = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const result = await getFiles({
    currentUserId: user?.$id,
    currentUserEmail: user?.email,
    type: getFileTypesParams(type),
    searchText: search,
  });

  const getTotalSize = (documents?: Models.DocumentList<Models.Document>) => {
    if (!documents) return "0 B";
    return convertFileSize(
      documents.documents.reduce((acc, doc) => acc + doc.size, 0),
    );
  };

  return (
    <div className="flex flex-col gap-9 pt-[34px] pr-[40px] pb-[58px] pl-[37px]">
      {result.success ? (
        <>
          <section className="text-light-1">
            <h1 className="h1 mb-2.5">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h1>
            <div className="flex justify-between">
              <div className="body-1">
                Total: <span className="h5">{getTotalSize(result.data)}</span>
              </div>
              <div className="text-light-2 flex gap-2.5 text-[14px] font-medium">
                Sort by: <div>sort</div>
              </div>
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
