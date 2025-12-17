import { forwardRef, useImperativeHandle, useState } from "react";
import EnvironmentCard from "./EnvironmentCard";
import type { EnvironmentWithCustomer } from "@/modules/customers/types";

interface EnvironmentListProps {
  environments: EnvironmentWithCustomer[];
}

export interface EnvironmentListRef {
  isRefreshing: boolean;
}

const EnvironmentList = forwardRef<EnvironmentListRef, EnvironmentListProps>(
  ({ environments }, ref) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    useImperativeHandle(ref, () => ({
      isRefreshing,
    }));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {environments.map((environment) => (
          <EnvironmentCard
            key={`${environment.tenantId}-${environment.name}`}
            environment={environment}
          />
        ))}
      </div>
    );
  }
);

EnvironmentList.displayName = "EnvironmentList";

export default EnvironmentList;
