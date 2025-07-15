"use client";

import React, { useEffect, useRef, useState } from "react";

const useContainerSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setSize(width);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};

type Point = { x: number; y: number };

interface ArcProgressProps {
  progress?: number;
  gapAngle?: number;
  children?: React.ReactNode;
}

const ArcProgress = ({
  progress = 0,
  gapAngle = 45,
  children,
}: ArcProgressProps) => {
  const [containerRef, size] = useContainerSize();
  const center = size / 2;
  const radius = size * 0.4;
  const innerRadius = radius - size * 0.06;
  const strokeWidth = size * 0.078;
  const sweepAngle = 360 - gapAngle;
  const angleStart = 180 + gapAngle / 2;
  const angleEnd = angleStart + (progress / 100) * sweepAngle;

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleDeg: number,
  ): Point => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ): string => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      1,
      end.x,
      end.y,
    ].join(" ");
  };

  const endPoint = polarToCartesian(center, center, radius, angleEnd);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        {/* Dashed inner arc */}
        <path
          d={describeArc(
            center,
            center,
            innerRadius,
            angleStart,
            angleStart + sweepAngle,
          )}
          stroke="#fff"
          strokeWidth={size * 0.004}
          strokeDasharray="3 8"
          fill="none"
          strokeLinecap="round"
          opacity={1}
        />

        {/* Background arc */}
        <path
          d={describeArc(
            center,
            center,
            radius,
            angleStart,
            angleStart + sweepAngle,
          )}
          stroke="#fff"
          opacity={0.2}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Foreground arc */}
        <path
          d={describeArc(center, center, radius, angleStart, angleEnd)}
          stroke="#fff"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.3s ease",
            filter: "drop-shadow(0px 3px 8px rgba(129, 212, 254, 0.2))",
          }}
        />

        {/* End dot */}
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={size * 0.0065}
          fill="#FCF1F1"
          style={{
            filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.15))",
          }}
        />
      </svg>

      {/* Center label */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
        className="text-white flex flex-col gap-[2px]"
      >
        {children}
      </div>
    </div>
  );
};

const CircularProgress = ({ value = 0 }: { value?: number }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const step = 1;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= value) {
          clearInterval(interval);
          return value;
        }
        return prev + step;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <ArcProgress progress={progress}>
      <div className="h2 leading-5">{progress}%</div>
      <div className="subtitle-1 md:subtitle-1 md:text-[12px] lg:subtitle-1">
        Space used
      </div>
    </ArcProgress>
  );
};

export default CircularProgress;
