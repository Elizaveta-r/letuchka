/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import styles from "./RegForm.module.scss";
import {
  validateEmail,
  validatePassword,
} from "../../utils/methods/validation";
import { InputAuth } from "../../ui/InputAuth/InputAuth";
import { Button } from "../../ui/Button/Button";
import { EyeIcon } from "../../assets/icons/EyeIcon";
import { EyeSlashIcon } from "../../assets/icons/EyeSlashIcon";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PasswordIcon from "../../components/PasswordIcon/PasswordIcon";

export const RegForm = ({ step, setStep }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [viewPassword, setViewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // автофокус на пароль при step = 1
  useEffect(() => {
    if (step === 1) {
      passwordRef.current?.focus();
    }
  }, [step]);

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  }, []);

  const handleSubmit = useCallback(() => {
    if (step === 0) {
      if (!emailError && email.length > 0) {
        localStorage.setItem("email", email);
        emailRef.current.blur();
        setStep(1);
      } else {
        toast.error("Введите адрес электронной почты");
      }
      return;
    }

    if (!passwordError && password) {
      console.log(email, password);
    } else {
      toast.error("Введите пароль");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    step,
    email,
    password,
    emailError,
    passwordError,
    dispatch,
    navigate,
    setStep,
  ]);

  const handlePrevStep = useCallback(() => setStep(0), [setStep]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={styles.form}>
      <div className={styles.inputs}>
        <InputAuth
          ref={emailRef}
          label="Адрес электронной почты"
          value={email}
          type="email"
          onChange={handleEmailChange}
          onKeyDown={step === 0 ? handleKeyDown : undefined}
          error={emailError}
          readOnly={step === 1}
          rightIcon={
            step === 1 && (
              <div className={styles.rightIcon} onClick={handlePrevStep}>
                Изменить
              </div>
            )
          }
        />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              className={styles.password}
              key="password-input"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <InputAuth
                ref={passwordRef}
                label="Пароль"
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                error={passwordError}
                type={viewPassword ? "text" : "password"}
                rightIcon={
                  <PasswordIcon
                    viewPassword={viewPassword}
                    setViewPassword={setViewPassword}
                  />
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        title="Продолжить"
        className={styles.button}
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );
};
