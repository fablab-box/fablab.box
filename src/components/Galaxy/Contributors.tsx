import React from "react";
import styles from "./Galaxy.module.css";
import { useIsMobile } from "../../hooks/useAutoGrid";

export type Contributor = { id: string; name: string; color?: string };

const getStyle = (
  i: number,
  total: number,
  color: string | undefined,
  isMobile: boolean
): React.CSSProperties => {
  const duration = isMobile ? 95 : 85;
  const radius   = isMobile ? 140 : 300;
  const delay    = -(duration / total) * i;

  return {
    ["--orbit-radius" as any]: `${radius}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    backgroundColor: color || undefined,
  } as React.CSSProperties;
};

const pause = (e: React.MouseEvent<HTMLDivElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.animationPlayState = "paused";
  (el.style as any).webkitAnimationPlayState = "paused";
};
const resume = (e: React.MouseEvent<HTMLDivElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.animationPlayState = "running";
  (el.style as any).webkitAnimationPlayState = "running";
};

export default function ContributorsOrbit({ contributors }: { contributors: Contributor[] }) {
  const isMobile = useIsMobile();
  return (
    <div className={styles.orbit}>
      {contributors.map((c, i) => (
        <div
          key={c.id}
          className={`${styles.contributor} cursor-target`}
          style={getStyle(i, contributors.length, c.color, isMobile)}
          onMouseEnter={isMobile ? undefined : pause}
          onMouseLeave={isMobile ? undefined : resume}
        >
          {c.name}
        </div>
      ))}
    </div>
  );
}
