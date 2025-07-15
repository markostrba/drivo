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
    getFileAnalytics({ userId: user.$id, email: user.email }),
  ]);

  const storageLimit = 6553600;
  const usageSummary = getUsageSummary(analytics || {});
  const totalUsedSpace = analytics?.totalUsedSpace || 0;

  return (
    <div className="p-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-10 h-full">
      <section className="">
        <div className="flex items-center rounded-[20px] bg-brand p-2 gap-2 text-white flex-col md:flex-row shadow-[0_2px_35px_0_rgba(65,89,214,0.3)] hover:scale-102">
          <div className="lg:w-40 lg:h-40 h-60 w-60 xl:w-60 xl:h-60 flex justify-center items-center">
            <div className="">
              <CircularProgress
                value={Math.round((totalUsedSpace / storageLimit) * 100)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-white text-center lg:text-left">
            <h1 className="h3 xl:text-[30px]">Available Storage</h1>
            <p className="subtitle-1 xl:text-[18px]">
              {convertFileSize(totalUsedSpace) || 0} /{" "}
              {convertFileSize(storageLimit)}
            </p>
          </div>
        </div>

        {/* Uploaded file type summaries */}
        <ul className="mt-6 grid grid-cols-1 gap-4 xl:mt-10 md:grid-cols-2 xl:gap-9">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="relative mt-6 rounded-[20px] bg-white p-5 transition-all hover:scale-105"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="absolute -left-[12px] -top-[25px] md:-left-[10px] md:-top-[18px] lg:-left-[11px] lg:-top-[20px] xl:-left-[12px] xl:-top-[25px]   z-10 w-[190px] object-contain"
                  />
                  <h4 className="h4 text-light-1 relative z-20 w-full text-right">
                    {convertFileSize(summary.size)}
                  </h4>
                </div>

                <h5 className="h5 text-light-1 relative z-20 text-center">
                  {summary.title}
                </h5>
                <Separator className="bg-[#A3B2C7]" />
                <div className="flex flex-col gap-1 text-center">
                  <p className="body-1 leading-5 text-light-2">Last update</p>
                  <FormattedDateTime
                    date={summary.latestDate}
                    className="text-center"
                  />
                </div>
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="h-full rounded-[20px] bg-white p-5 xl:p-8">
        <h2 className="h3 xl:h2 text-light-1">Recent files uploaded</h2>
        {files?.documents?.length! > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files?.documents.map((file: Models.Document) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file.$id}
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="flex w-full flex-row xl:justify-between">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="subtitle-2 line-clamp-1  text-light-1">
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
