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
];

export const avatarPlaceholderUrl =
  "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

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
