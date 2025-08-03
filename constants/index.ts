import { getEnv } from "@/lib/utils";
import { DocAnalytics } from "@/types";

export const navItems = [
  {
    name: "Dashboard",
    icon: {
      dark: "/assets/icons/dashboard.svg",
      light: "/assets/icons/dashboard-light.svg",
    },
    url: "/",
  },
  {
    name: "Documents",
    icon: {
      dark: "/assets/icons/documents.svg",
      light: "/assets/icons/documents-light.svg",
    },
    url: "/documents",
  },
  {
    name: "Images",
    icon: {
      dark: "/assets/icons/images.svg",
      light: "/assets/icons/images-light.svg",
    },
    url: "/images",
  },
  {
    name: "Media",
    icon: {
      dark: "/assets/icons/video.svg",
      light: "/assets/icons/video-light.svg",
    },
    url: "/media",
  },
  {
    name: "Others",
    icon: {
      dark: "/assets/icons/others.svg",
      light: "/assets/icons/others-light.svg",
    },
    url: "/others",
  },
  {
    name: "Plans",
    icon: {
      dark: "/assets/icons/gem.svg",
      light: "/assets/icons/gem-light.svg",
    },
    url: "/plans",
  },
];

export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

export const PLAN_FILE_RULES = [
  {
    plan: "Free",
    maxSize: 500 * 1024 * 1024,
    uploadLimit: 3,
  },
  {
    plan: "Starter",
    maxSize: 1024 * 1024 * 1024,
    uploadLimit: 10,
  },
  {
    plan: "Pro",
    maxSize: 3 * 1024 * 1024 * 1024,
    uploadLimit: 20,
  },
];

export const MAX_FILE_SIZE = 5000 * 1024 * 1024;

export const actionsDropdownItems = [
  {
    label: "Rename",
    icon: "/assets/icons/edit.svg",
    value: "rename",
  },
  {
    label: "Details",
    icon: "/assets/icons/info.svg",
    value: "details",
  },
  {
    label: "Share",
    icon: "/assets/icons/share.svg",
    value: "share",
  },
  {
    label: "Download",
    icon: "/assets/icons/download.svg",
    value: "download",
  },
  {
    label: "Delete",
    icon: "/assets/icons/delete.svg",
    value: "delete",
  },
];

export const sortTypes = [
  {
    label: "Date created (newest)",
    value: "$createdAt-desc",
  },
  {
    label: "Created Date (oldest)",
    value: "$createdAt-asc",
  },
  {
    label: "Name (A-Z)",
    value: "name-asc",
  },
  {
    label: "Name (Z-A)",
    value: "name-desc",
  },
  {
    label: "Size (Highest)",
    value: "size-desc",
  },
  {
    label: "Size (Lowest)",
    value: "size-asc",
  },
];

export const getUsageSummary = ({
  documents,
  images,
  media,
  others,
}: Partial<{
  documents: DocAnalytics;
  images: DocAnalytics;
  media: DocAnalytics;
  others: DocAnalytics;
}> = {}) => [
  {
    title: "Documents",
    size: documents?.usedSpace || 0,
    latestDate: documents?.lastUpdate || "",
    icon: "/assets/icons/documents-light.svg",
    circleColor: "255, 116, 116",
    url: "/documents",
  },
  {
    title: "Images",
    size: images?.usedSpace || 0,
    latestDate: images?.lastUpdate || "",
    icon: "/assets/icons/images-light.svg",
    circleColor: "86, 184, 255",
    url: "/images",
  },
  {
    title: "Media",
    size: media?.usedSpace || 0,
    latestDate: media?.lastUpdate || "",
    icon: "/assets/icons/video-light.svg",
    circleColor: "61, 217, 179",
    url: "/media",
  },
  {
    title: "Others",
    size: others?.usedSpace || 0,
    latestDate: others?.lastUpdate || "",
    icon: "/assets/icons/others-light.svg",
    circleColor: "238, 168, 253",
    url: "/others",
  },
];

export const plans = [
  {
    title: "Free",
    description:
      "Get started with essential features. No credit card required.",
    price: 0,
    priceId: undefined,
    url: "/",
    perks: ["500MB Storage", "Upload up to 3 files simultaneously"],
  },
  {
    title: "Starter",
    description:
      "Upgrade for more storage and higher upload limits—ideal for growing needs.",
    price: 9.99,
    priceId: getEnv(
      "STRIPE_STARTER_PRICE_ID",
      process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    ),
    url: "/buy/",
    perks: ["1GB Storage", "Upload up to 10 files simultaneously"],
  },
  {
    title: "Pro",
    description:
      "Unlock the full potential with advanced capacity and maximum flexibility.",
    price: 19.99,
    priceId: getEnv(
      "STRIPE_PRO_PRICE_ID",
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    ),
    url: "/buy/",
    perks: ["3GB Storage", "Upload up to 20 files simultaneously"],
  },
];

export const PUBLIC_URL = getEnv(
  "PUBLIC_HOST_URL",
  process.env.NEXT_PUBLIC_HOST_URL,
);
