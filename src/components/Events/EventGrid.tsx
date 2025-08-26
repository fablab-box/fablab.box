import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Events.module.css";
import EventCard, { EventItem } from "./EventCard";
import SciFiPanel from "../Panels/SciFiPanel";
import { useIsMobile } from "../../hooks/useAutoGrid";

export default function EventGrid({
  events,
  title = "CALENDAR",
}: {
  events: EventItem[];
  title?: string;
}) {
  const now = Date.now();
  const isMobile = useIsMobile();

  const upcoming = useMemo(
    () =>
      events
        .filter(e => new Date(e.date).getTime() >= now)
        .sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [events, now]
  );

  const past = useMemo(
    () =>
      events
        .filter(e => new Date(e.date).getTime() < now)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [events, now]
  );

  const trackRefUp = useRef<HTMLDivElement>(null);
  const trackRefPast = useRef<HTMLDivElement>(null);
  const [idxUp, setIdxUp] = useState(0);
  const [idxPast, setIdxPast] = useState(0);
  const scrollEndTOUp = useRef<number | null>(null);
  const scrollEndTOPast = useRef<number | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>, itemsLen: number, setIndex: (i: number) => void, i: number) => {
    const el = ref.current; if (!el || itemsLen === 0) return;
    const clamped = Math.max(0, Math.min(i, itemsLen - 1));
    const child = el.children.item(clamped) as HTMLElement | null;
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setIndex(clamped);
  };

  const snapToClosest = (ref: React.RefObject<HTMLDivElement>, setIndex: (i: number) => void) => {
    const el = ref.current; if (!el) return;
    const tr = el.getBoundingClientRect();
    const center = tr.left + tr.width / 2;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const r = (el.children[i] as HTMLElement).getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    setIndex(best);
    const child = el.children.item(best) as HTMLElement | null;
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const onTrackScroll = (
    ref: React.RefObject<HTMLDivElement>,
    setIndex: (i: number) => void,
    toRef: React.MutableRefObject<number | null>
  ) => {
    const el = ref.current; if (!el) return;
    const tr = el.getBoundingClientRect();
    const center = tr.left + tr.width / 2;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const r = (el.children[i] as HTMLElement).getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    setIndex(best);
    if (toRef.current) window.clearTimeout(toRef.current);
    toRef.current = window.setTimeout(() => snapToClosest(ref, setIndex), 80);
  };

  useEffect(() => {
    if (!isMobile) return;
    requestAnimationFrame(() => {
      scrollTo(trackRefUp, upcoming.length, setIdxUp, 0);
      scrollTo(trackRefPast, past.length, setIdxPast, 0);
    });
  }, [isMobile, upcoming.length, past.length]);

  if (isMobile) {
    return (
      <SciFiPanel variant="large">
        <h2>{title}</h2>

        <section className={styles.wrap}>
          {/* upcoming events */}
          {upcoming.length > 0 && (
            <section className={`${styles.section} ${styles.upcoming}`}>
              <h3 className={styles.sectionTitle}>Upcoming</h3>

              <div className={styles.carousel} aria-roledescription="carousel">
                <div
                  className={styles.track}
                  ref={trackRefUp}
                  onScroll={() => onTrackScroll(trackRefUp, setIdxUp, scrollEndTOUp)}
                  tabIndex={0}
                  aria-label="Upcoming Events Carousel"
                >
                  {upcoming.map(ev => (
                    <div key={ev.id} className={`${styles.slide}`}>
                      <EventCard item={ev} />
                    </div>
                  ))}
                </div>

                <div className={styles.controls}>
                  <button className={styles.navBtn} onClick={() => scrollTo(trackRefUp, upcoming.length, setIdxUp, idxUp - 1)} aria-label="Previous">‹</button>
                  <div className={styles.dots} role="tablist" aria-label="Upcoming slides">
                    {upcoming.map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.dot} ${i === idxUp ? styles.dotActive : ""}`}
                        aria-selected={i === idxUp}
                        role="tab"
                        onClick={() => scrollTo(trackRefUp, upcoming.length, setIdxUp, i)}
                      />
                    ))}
                  </div>
                  <button className={styles.navBtn} onClick={() => scrollTo(trackRefUp, upcoming.length, setIdxUp, idxUp + 1)} aria-label="Next">›</button>
                </div>
              </div>
            </section>
          )}

          {upcoming.length > 0 && past.length > 0 && <div className={styles.sectionDivider} aria-hidden />}

          {/* PAST events */}
          {past.length > 0 && (
            <section className={`${styles.section} ${styles.replay}`}>
              <h3 className={styles.sectionTitle}>Past Events</h3>

              <div className={styles.carousel} aria-roledescription="carousel">
                <div
                  className={styles.track}
                  ref={trackRefPast}
                  onScroll={() => onTrackScroll(trackRefPast, setIdxPast, scrollEndTOPast)}
                  tabIndex={0}
                  aria-label="Past Events Carousel"
                >
                  {past.map(ev => (
                    <div key={ev.id} className={`${styles.slide}`}>
                      <EventCard item={ev} />
                    </div>
                  ))}
                </div>

                <div className={styles.controls}>
                  <button className={styles.navBtn} onClick={() => scrollTo(trackRefPast, past.length, setIdxPast, idxPast - 1)} aria-label="Previous">‹</button>
                  <div className={styles.dots} role="tablist" aria-label="Past slides">
                    {past.map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.dot} ${i === idxPast ? styles.dotActive : ""}`}
                        aria-selected={i === idxPast}
                        role="tab"
                        onClick={() => scrollTo(trackRefPast, past.length, setIdxPast, i)}
                      />
                    ))}
                  </div>
                  <button className={styles.navBtn} onClick={() => scrollTo(trackRefPast, past.length, setIdxPast, idxPast + 1)} aria-label="Next">›</button>
                </div>
              </div>
            </section>
          )}

          <div className={styles.tailSpacer} aria-hidden />
        </section>
      </SciFiPanel>
    );
  }

  const upcoming3 = upcoming.slice(0, 3);
  const past3 = past.slice(0, 3);

  return (
    <SciFiPanel variant="large">
      <h2>{title}</h2>

      <section className={styles.wrap}>
        {upcoming3.length > 0 && (
          <section className={`${styles.section} ${styles.upcoming}`}>
            <div className={styles.grid}>
              {upcoming3.map(ev => <EventCard key={ev.id} item={ev} />)}
            </div>
          </section>
        )}

        {past3.length > 0 && (
          <>
            <div className={styles.sectionDivider} aria-hidden />
            <section className={`${styles.section} ${styles.replay}`}>
              <h3 className={styles.sectionTitle}>Past Events</h3>
              <div className={styles.grid}>
                {past3.map(ev => <EventCard key={ev.id} item={ev} />)}
              </div>
            </section>
          </>
        )}

        <div className={styles.tailSpacer} aria-hidden />
      </section>
    </SciFiPanel>
  );
}
