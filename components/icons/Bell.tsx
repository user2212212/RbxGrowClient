"use client";

import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

export function BellIcon({
  className,
  incoming = false,
}: {
  className?: string;
  incoming?: boolean;
}) {
  const controls = useAnimationControls();
  const [dotActive, setDotActive] = useState(incoming);

  useEffect(() => {
    if (incoming) {
      setDotActive(true);
      controls.start({
        rotate: [0, -15, 12, -10, 8, -5, 3, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      });
    } else {
      setDotActive(false);
    }
  }, [incoming, controls]);

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className ?? ""}`}
      animate={controls}
      style={{ transformOrigin: "50% 8%" }}
    >
      <path
        d="M9.41177 24C8.76471 24 8.21098 23.7652 7.75059 23.2956C7.2902 22.826 7.05961 22.2608 7.05883 21.6H11.7647C11.7647 22.26 11.5345 22.8252 11.0741 23.2956C10.6137 23.766 10.0596 24.0008 9.41177 24ZM1.17647 20.4C0.843141 20.4 0.563926 20.2848 0.338828 20.0544C0.11373 19.824 0.00078837 19.5392 4.05679e-06 19.2C-0.000780257 18.8608 0.112161 18.576 0.338828 18.3456C0.565494 18.1152 0.84471 18 1.17647 18H2.35294V9.6C2.35294 7.94 2.84314 6.4652 3.82353 5.1756C4.80392 3.886 6.07843 3.0408 7.64706 2.64V1.8C7.64706 1.3 7.81883 0.875203 8.16236 0.525603C8.50588 0.176003 8.92236 0.000802727 9.41177 2.72727e-06C9.90118 -0.000797273 10.318 0.174403 10.6624 0.525603C11.0067 0.876803 11.178 1.3016 11.1765 1.8V2.19C10.9804 2.59 10.8333 3.01 10.7353 3.45C10.6373 3.89 10.5882 4.34 10.5882 4.8C10.5882 6.46 11.162 7.8752 12.3094 9.0456C13.4569 10.216 14.8439 10.8008 16.4706 10.8V18H17.6471C17.9804 18 18.26 18.1152 18.4859 18.3456C18.7118 18.576 18.8243 18.8608 18.8235 19.2C18.8227 19.5392 18.7098 19.8244 18.4847 20.0556C18.2596 20.2868 17.9804 20.4016 17.6471 20.4H1.17647Z"
        stroke="currentColor"
        fill="currentColor"
      />

      <motion.circle
        cx="16.4706"
        cy="4.8"
        r="3.7"
        fill={dotActive ? "#EF4444" : "currentColor"}
        animate={{ scale: dotActive ? [0, 1.3, 1] : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}