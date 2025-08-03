"use client";
import React, { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import Image from "next/image";
import { toast } from "sonner";
// import { uploadFile } from "@/lib/actions/file.action";
import {
  cn,
  convertFileSize,
  convertFileToUrl,
  getFileType,
} from "@/lib/utils";
import useUploadFile from "@/hooks/useUploadFile";
import { UploadProgress } from "appwrite";
import { Progress } from "@/components/ui/progress";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE, PLAN_FILE_RULES } from "@/constants";
import { Plans } from "@/types";
interface Props {
  ownerId: string;
  className?: string;
  plan: Plans;
}

const FileUploader = ({ ownerId, className, plan }: Props) => {
  const [files, setFiles] = useState<{ file: File; progress: number }[]>([]);
  const { uploadFile, cancelUploadFile } = useUploadFile({
    ownerId,
  });
  const userPlan = plan || "Free";
  const onProgress = (progress: UploadProgress, fileName: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((prevFile) =>
        prevFile.file.name === fileName
          ? { ...prevFile, progress: progress.progress }
          : prevFile,
      ),
    );
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file) => ({ file, progress: 0 })));

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((files) =>
            files.filter(({ file: prevFile }) => prevFile.name !== file.name),
          );

          return toast(file.name, {
            description: `Max file size is ${convertFileSize(MAX_FILE_SIZE)}`,
            classNames: {
              title: "font-semibold!",
              description: "body-2!",
            },
            className: "!text-white !bg-red !rounded-[10px]",
          });
        }

        return uploadFile(file, onProgress)
          .then((uploadFile) => {
            if (!uploadFile.success) {
              toast(uploadFile.error.message, {
                classNames: {
                  title: "font-semibold!",
                  description: "body-2!",
                },
                className: "!text-white !bg-red !rounded-[10px]",
              });
            }
            console.log("[FileUploader]", { uploadFile });
            if (uploadFile) {
              setFiles((prevFiles) =>
                prevFiles.filter(
                  ({ file: prevFile }) => prevFile.name !== file.name,
                ),
              );
            }
          })
          .catch((err) => {
            console.log("[FileUploader]", { err });
          });
      });

      await Promise.all(uploadPromises);
    },
    [uploadFile],
  );
  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      const error = fileRejections[0]?.errors[0];
      switch (error.code) {
        case "file-too-large":
          toast.error("Failed to upload picture", {
            description: "File is too large. Max size is 5MB.",
          });
          break;
        case "too-many-files":
          toast.error("Failed to upload picture", {
            description: `Your current plan allows up to ${
              PLAN_FILE_RULES.find((planRule) => planRule.plan === userPlan)
                ?.uploadLimit
            } file uploads at a time.`,
          });
          break;
        default:
          toast.error("File could not be uploaded.");
      }
    },
    [userPlan],
  );
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDropRejected,
    noClick: true,
    maxFiles: PLAN_FILE_RULES.find((planRule) => planRule.plan === userPlan)
      ?.uploadLimit,
  });

  const handleDelete = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    cancelUploadFile(fileName);
    setFiles((prevFiles) =>
      prevFiles.filter(({ file: prevFile }) => prevFile.name !== fileName),
    );
  };

  return (
    <div {...getRootProps()} className="">
      <input {...getInputProps()} />
      <Button
        className={cn(
          "bg-brand hover:bg-brand-100 !shadow-2 flex h-[52px] gap-2 rounded-[41px] px-10",
          className,
        )}
        onClick={open}
      >
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={20}
          height={20}
        />
        <span className="button">Upload</span>
      </Button>
      {files.length > 0 && (
        <ul className="!shadow-1 fixed right-10 bottom-10 z-50 flex size-full h-fit max-w-[480px] flex-col gap-3 rounded-[20px] bg-white p-7">
          <h3 className="h4 text-light-100">Uploading</h3>
          {files.map(({ file, progress }, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${file.name}-${index}`}
                className="!shadow-3 flex items-center justify-between gap-3 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <div className="max-w-[300px]">
                    <span className="subtitle-2 mb-2 line-clamp-1">
                      {file.name}
                    </span>
                    <Progress value={progress} className="h-[4px] w-[80px]" />
                  </div>
                </div>
                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleDelete(e, file.name)}
                  className="cursor-pointer"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
