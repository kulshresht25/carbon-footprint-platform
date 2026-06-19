"use client";

import React, { useEffect } from "react";

export function AxeAudit() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      Promise.all([import("@axe-core/react"), import("react-dom")]).then(([axe, reactDOM]) => {
        axe.default(React, reactDOM, 1000);
      });
    }
  }, []);

  return null;
}
