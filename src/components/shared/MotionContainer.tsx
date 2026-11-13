"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

interface MotionContainerProps {
  children: ReactNode;
  className?: string;
}

export function MotionContainer({ children, className }: MotionContainerProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
