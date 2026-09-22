"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ShapeWaves from "@/components/ShapeWaves";
const NotFound = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <ShapeWaves
          text="404 :("
          fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
          fontWeight={500}
          textSize={0.6}
          shapes="mixed"
          cellSize={10}
          dotSize={0.58}
          color="#9747ff"
          hoverColor="#9747ff"
          backgroundColor="#000000"
          speed={1}
          scale={1}
          contrast={0.4}
          brightness={0.4}
          flow={0}
          direction={0}
          fade={0.25}
          interactive
          splashRadius={40}
          splashStrength={0.4}
          glow={0.45}
          paused={false}
        />
      </div>
    </>
  );
};

export default NotFound;
