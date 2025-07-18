import React from "react";

const HamburgerIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x={1.83398}
        y={3.66602}
        width={18.3333}
        height={2.75}
        rx={1.375}
        fill="#333F4E"
      />
      <rect
        x={1.83398}
        y={9.625}
        width={18.3333}
        height={2.75}
        rx={1.375}
        fill="#333F4E"
      />
      <rect
        x={1.83398}
        y={15.584}
        width={18.3333}
        height={2.75}
        rx={1.375}
        fill="#333F4E"
      />
    </svg>
  );
};

export default HamburgerIcon;
