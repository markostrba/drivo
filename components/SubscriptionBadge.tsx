import { Plans } from "@/types";
import { Star } from "lucide-react";
import React from "react";

const SubscriptionBadge = ({ plan = "Free" }: { plan: Plans }) => {
  return (
    <div className="bg-green flex max-w-fit items-center gap-1.5 rounded-full px-2">
      <Star size={10} fill="white" color="white" />
      <span className="text-xs font-medium text-white">{plan}</span>
    </div>
  );
};

export default SubscriptionBadge;
