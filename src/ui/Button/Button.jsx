/* eslint-disable no-unused-vars */
import { RingLoader } from "react-spinners";
import styles from "./Button.module.scss";
import { AnimatePresence, motion } from "framer-motion";

export const Button = ({
  title,
  onClick,
  className,
  leftIcon,
  loading,
  disabled,
  secondary,
}) => {
  return (
    <div
      className={`${styles.button} ${className} ${
        loading ? styles.loading : ""
      } ${disabled ? styles.disabled : ""} ${
        secondary ? styles.secondary : ""
      }`}
      onClick={!loading && !disabled ? onClick : () => {}}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <RingLoader size={18} color="#fff" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className={styles.content}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {leftIcon && (
                <motion.div
                  key={leftIcon?.type?.render?.displayName || "icon"}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className={styles.leftIcon}
                >
                  {leftIcon}
                </motion.div>
              )}
            </AnimatePresence>
            {title}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
