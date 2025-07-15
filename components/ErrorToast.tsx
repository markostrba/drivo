"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const ErrorToast = ({
  error,
  title,
}: {
  error?: { message: string };
  title: string;
}) => {
  useEffect(() => {
    if (error) {
      toast.error(title, {
        description: error.message,
      });
    }
  }, [error, title]);

  return null;
};

export default ErrorToast;
