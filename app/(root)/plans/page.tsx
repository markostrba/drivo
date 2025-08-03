import PlanCard from "@/components/PlanCard";
import React from "react";
import { plans } from "@/constants/index";
import { getCurrentUser } from "@/lib/actions/user.action";
const Page = async () => {
  const { data: user } = await getCurrentUser();

  const enrolledPlan = user?.plan || "Free";

  return (
    <div className="flex flex-col items-center gap-20 pt-5">
      <div className="text-center">
        <h1 className="h1 text-light-1 mb-1 text-4xl">Plans & Pricing</h1>
        <p className="body-2 text-muted-foreground">
          Choose the plan that fits your needs and scale as you grow.
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={
              plan.title === "Starter"
                ? "bg-brand rounded-2xl p-[3px] lg:mb-5 lg:hover:scale-105"
                : ""
            }
          >
            {plan.title === "Starter" && (
              <p className="body-1 py-2 text-center text-white">
                Most Recommended!
              </p>
            )}
            <PlanCard
              {...plan}
              planButtonText={
                plan.title === enrolledPlan ? "Manage Plan" : "Upgrade Plan"
              }
              buttonStyle={
                plan.title === "Free" ? "bg-neutral-200 text-neutral-800" : ""
              }
              buttonProps={plan.title === "Free" ? { disabled: true } : {}}
              cardStyle={plan.title === "Starter" ? "lg:hover:scale-100" : ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
