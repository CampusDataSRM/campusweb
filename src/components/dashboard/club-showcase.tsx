"use client";

import { useMemo } from "react";
import InfiniteSpiral from "@/components/InfiniteSpiral";
import { useClubs } from "@/hooks/use-student-data";
import { STUDENT_ROUTES } from "@/constants/routes";

export function ClubShowcase() {
  const clubsQuery = useClubs();

  const items = useMemo(() => {
    if (!clubsQuery.data) return [];
    
    // Filter valid logos and sort by popularity
    const validClubs = [...clubsQuery.data]
      .filter((c) => c.logo && c.logo.trim() !== "")
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 14);

    return validClubs.map((club) => ({
      id: club.id,
      src: club.logo,
      alt: club.name,
      label: club.name,
      href: `${STUDENT_ROUTES.clubs}/${club.id}`,
      target: "_self" as const,
    }));
  }, [clubsQuery.data]);

  if (clubsQuery.isLoading) {
    return (
      <div className="panel h-112.5 flex flex-col justify-center items-center border border-outline-variant/30">
        <div className="animate-pulse bg-surface-highest/40 w-full h-full rounded-xl" />
      </div>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className="panel relative overflow-hidden h-112.5 flex flex-col p-0 border border-outline-variant/20 shadow-xl bg-surface-lowest sm:rounded-[24px]">
      <div className=" p-4 z-10 pointer-events-none drop-shadow-md flex gap-2 items-center justify-between">
        <h3 className="text-xl font-black text-on-surface mb-0.5">Campus Clubs</h3>
        <p className="text-xs font-bold text-primary-accent uppercase tracking-widest">Find your tribe</p>
      </div>
      
      {/* 
        A subtle gradient to blend the edges of the spiral 
        into the panel, creating depth.
      */}
      <div className="absolute inset-0 z-0 bg-linear-to-b from-surface-lowest via-transparent to-surface-lowest pointer-events-none opacity-60" />

      <div className="absolute inset-0 pt-16 z-0">
        <InfiniteSpiral
          items={items}
          animationMode="auto"
          speed={0.35}
          direction="up"
          radius={130}
          cardWidth={100}
          cardHeight={100}
          verticalSpacing={55}
          perspective={800}
          cardsPerTurn={8}
          cardRadius={16}
          centerScale={1.2}
          edgeFade={0.4}
          edgeBlur={6}
          imageFit="contain"
          pauseOnHover={false}
        />
      </div>
    </div>
  );
}
