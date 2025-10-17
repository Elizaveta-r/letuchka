import { createPortal } from "react-dom";
import { useState, useRef, useEffect } from "react";
import styles from "./HintWithPortal.module.scss";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";
import { CircleAlert } from "lucide-react";

export const HintWithPortal = ({
  children,
  hintContent,
  position = "top",
  hasIcon = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      let top = rect.top + scrollTop;
      let left = rect.left + scrollLeft;

      // Позиционирование в зависимости от position
      switch (position) {
        case "top":
          top -= 10; // Отступ над элементом
          left += rect.width / 2;
          break;
        case "bottom":
          top += rect.height + 10;
          left += rect.width / 2;
          break;
        case "left":
          top += rect.height / 2;
          left -= 10;
          break;
        case "right":
          top += rect.height / 2;
          left += rect.width + 10;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  const tooltipVariants = {
    initial: { opacity: 0, y: 5, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    exit: { opacity: 0, y: 5, scale: 0.95 },
  };

  const AnimatedIcon = (
    <motion.div
      whileHover={{
        scale: 1.1,
        rotate: [0, -10, 10, -5, 5, 0],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      }}
      className={styles.hintIcon}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <CircleAlert size={16} color="#10b981" style={{ cursor: "pointer" }} />
    </motion.div>
  );

  return (
    <div className={styles.hintContainer}>
      {hasIcon ? (
        <div className={styles.hintTarget}>
          {children}
          <div ref={triggerRef} className={styles.hintTriggerWrapper}>
            {AnimatedIcon}
          </div>
        </div>
      ) : (
        <div
          ref={triggerRef}
          className={styles.hintTarget}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </div>
      )}

      {/* Portal для tooltip */}
      {isVisible &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className={`${styles.hintTooltipPortal} ${styles[position]}`}
              style={{
                position: "absolute",
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                zIndex: 9999,
              }}
              variants={tooltipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {hintContent}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
