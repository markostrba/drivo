import ActionDropdown from "@/components/ActionDropdown";
import CardSummary from "@/components/CardSummary";
import CircularProgress from "@/components/CircularProgress";
import ErrorToast from "@/components/ErrorToast";
import FormattedDateTime from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { getUsageSummary } from "@/constants";
import { getFileAnalytics, getFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import { convertFileSize } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Models } from "node-appwrite";
import React from "react";

export const metadata = {
  title: "Dashboard - Drivo",
};

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const sort = ((await searchParams)?.sort as string) || "";
  const search = ((await searchParams)?.query as string) || "";
  const { data: user } = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const [
    { error: filesError, data: files },
    { error: analyticsError, data: analytics },
  ] = await Promise.all([
    getFiles({
      currentUserId: user?.$id,
      currentUserEmail: user?.email,
      type: [],
      searchText: search,
      sort,
    }),
    getFileAnalytics({ userId: user.$id }),
  ]);

  const storageLimit = 6553600;
  const usageSummary = getUsageSummary(analytics || {});
  const totalUsedSpace = analytics?.totalUsedSpace || 0;
  const filesData = files?.documents || [];

  return (
    <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:gap-10">
      <section className="flex flex-col items-center gap-10 sm:gap-8">
        <div className="bg-brand flex w-full flex-col rounded-[20px] shadow-[0_2px_35px_0_rgba(65,89,214,0.3)] hover:scale-102 sm:items-center xl:flex-row">
          <div className="flex items-center justify-center">
            <div className="relative aspect-square xl:max-h-[190px]">
              <CircularProgress
                value={Math.round((totalUsedSpace / storageLimit) * 100)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-4 text-center text-white sm:pl-4 sm:text-left">
            <h1 className="h3">Available Storage</h1>
            <p className="subtitle-1 text-center">
              {convertFileSize(totalUsedSpace)} /{" "}
              {convertFileSize(storageLimit)}
            </p>
          </div>
        </div>

        <ul className="grid h-[1000px] w-full grid-cols-1 gap-7.5 md:h-full md:max-h-[500px] md:grid-cols-2 md:gap-5">
          {usageSummary.map((item) => (
            <CardSummary key={item.title} {...item} />
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="h-full rounded-[20px] bg-white p-5 xl:p-8">
        <h2 className="h3 xl:h2 text-light-1">Recent files uploaded</h2>
        {filesData.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files?.documents.map((file: Models.Document) => (
              <li key={file.$id}>
                <div className="flex justify-between">
                  <Link
                    href={file.url}
                    target="_blank"
                    className="flex items-center gap-3"
                  >
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                    />

                    <div className="flex flex-1 flex-col gap-1">
                      <p className="subtitle-2 text-light-1 max-w-[150px] truncate md:max-w-[200px] lg:max-w-[250px] 2xl:max-w-[400px]">
                        {file.name}
                      </p>
                      <FormattedDateTime
                        date={file.$createdAt}
                        className="caption"
                      />
                    </div>
                  </Link>
                  <ActionDropdown file={file} userId={user.$id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
      {analyticsError && (
        <ErrorToast
          error={analyticsError}
          title="Something went wrong while calculating your storage usage"
        />
      )}
      {filesError && (
        <ErrorToast
          error={filesError}
          title="Something went wrong while loading your files"
        />
      )}
    </div>
  );
};

export default DashboardPage;
