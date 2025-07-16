import ActionDropdown from "@/components/ActionDropdown";
import CircularProgress from "@/components/CircularProgress";
import ErrorToast from "@/components/ErrorToast";
import FormattedDateTime from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getUsageSummary } from "@/constants";
import { getFileAnalytics, getFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import { convertFileSize } from "@/lib/utils";
import Image from "next/image";
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
    <div className="grid h-full grid-cols-1 gap-6 p-5 pt-6 md:grid-cols-2 xl:gap-10">
      <section className="">
        <div className="bg-brand flex flex-col items-center gap-2 rounded-[20px] p-2 text-white shadow-[0_2px_35px_0_rgba(65,89,214,0.3)] hover:scale-102 md:flex-row">
          <div className="flex h-60 w-60 items-center justify-center lg:h-40 lg:w-40 xl:h-60 xl:w-60">
            <div className="">
              <CircularProgress
                value={Math.round((totalUsedSpace / storageLimit) * 100)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center text-white lg:text-left">
            <h1 className="h3 xl:text-[30px]">Available Storage</h1>
            <p className="subtitle-1 xl:text-[18px]">
              {convertFileSize(totalUsedSpace) || 0} /{" "}
              {convertFileSize(storageLimit)}
            </p>
          </div>
        </div>

        {/* Uploaded file type summaries */}
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:mt-10 xl:gap-9">
          {usageSummary.map((summary) => (
            <li
              key={summary.title}
              className="relative mt-6 rounded-[20px] bg-white p-5 transition-all hover:scale-105"
            >
              <Link href={summary.url}>
                <div className="space-y-4">
                  <div className="flex justify-between gap-3">
                    <Image
                      src={summary.icon}
                      width={100}
                      height={100}
                      alt="uploaded image"
                      loading="eager"
                      className="absolute -top-[25px] -left-[12px] z-10 w-[190px] object-contain md:-top-[18px] md:-left-[10px] lg:-top-[20px] lg:-left-[11px] xl:-top-[25px] xl:-left-[12px]"
                    />
                    <h2 className="h4 text-light-1 relative z-20 w-full text-right">
                      {convertFileSize(summary.size)}
                    </h2>
                  </div>

                  <h1 className="h5 text-light-1 relative z-20 text-center">
                    {summary.title}
                  </h1>
                  <Separator className="bg-[#A3B2C7]" />
                  <div className="flex flex-col gap-1 text-center">
                    <p className="body-1 text-light-2 leading-5">Last update</p>
                    <FormattedDateTime
                      date={summary.latestDate}
                      className="text-center"
                    />
                  </div>
                </div>
              </Link>
            </li>
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

                  <div className="flex w-full flex-row xl:justify-between">
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="subtitle-2 text-light-1 line-clamp-1">
                        {file.name}
                      </p>
                      <FormattedDateTime
                        date={file.$createdAt}
                        className="caption"
                      />
                    </div>
                    <ActionDropdown file={file} userId={user.$id} />
                  </div>
                </Link>
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
