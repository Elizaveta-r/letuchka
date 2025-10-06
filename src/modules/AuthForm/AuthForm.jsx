import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { InputAuth } from "../../ui/InputAuth/InputAuth";
import { Button } from "../../ui/Button/Button";
import { validateEmail } from "../../utils/methods/validation";

import styles from "./AuthForm.module.scss";
import { toast } from "sonner";
import PasswordIcon from "../../components/PasswordIcon/PasswordIcon";

export const AuthForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  const [viewPassword, setViewPassword] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

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
    setPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (step === 0) {
      if (!emailError && email) {
        localStorage.setItem("email", email);
        emailRef.current.blur();
        setStep(1);
      } else {
        toast.error("Введите адрес электронной почты");
      }
      return;
    } else {
      if (!password) {
        toast.error("Введите пароль");
        return;
      } else {
        navigate("/");
      }
    }
  }, [step, email, password, emailError, dispatch, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleResetPassword = useCallback(() => {
    console.log("handleResetPassword");
  }, []);

  return (
    <div className={styles.form}>
      <div className={styles.inputs}>
        <InputAuth
          ref={emailRef}
          label="Адрес электронной почты"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={step === 0 ? handleKeyDown : undefined}
          error={emailError}
          readOnly={step === 1}
          type="email"
          rightIcon={
            step === 1 && (
              <div className={styles.rightIcon} onClick={() => setStep(0)}>
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
                type={viewPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                rightIcon={
                  <PasswordIcon
                    viewPassword={viewPassword}
                    setViewPassword={setViewPassword}
                  />
                }
              />
              <div className={styles.forgot} onClick={handleResetPassword}>
                Забыли пароль?
              </div>
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
