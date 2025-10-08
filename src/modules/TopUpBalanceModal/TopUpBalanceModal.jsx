import React, { useState, useMemo } from "react";
import styles from "./TopUpBalanceModal.module.scss";
import { CreditCard, Zap, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import Modal from "../../ui/Modal/Modal";
import formatWithSpaces from "../../utils/methods/formatNumberWithSpaces";

// Минимальная сумма пополнения для валидации
const MIN_TOPUP_AMOUNT = 100;

// Быстрые суммы для удобства
const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

// Принимает:
// - currentBalance: текущий баланс пользователя
// - isOpen: булево значение (открыто/закрыто)
// - onClose: функция для закрытия модалки
// - onSubmit: функция для отправки суммы в Robokassa
export default function TopUpBalanceModal({
  currentBalance = "20",
  isOpen,
  onClose,
  onSubmit,
}) {
  // Состояние для вводимой пользователем суммы
  const [amount, setAmount] = useState("");

  // Конвертируем в число для валидации
  const amountNumber = parseFloat(amount);

  // Валидация: проверяем, что сумма > MIN_TOPUP_AMOUNT
  const isAmountValid = amountNumber >= MIN_TOPUP_AMOUNT;

  // Сообщение об ошибке
  const errorMessage = useMemo(() => {
    if (amount === "") return null;
    if (amountNumber > 0 && amountNumber < MIN_TOPUP_AMOUNT) {
      return `Минимальная сумма пополнения: ${MIN_TOPUP_AMOUNT} ₽`;
    }
    return null;
  }, [amountNumber, amount]);

  // Обработчик отправки формы (имитирует переход к Робокассе)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAmountValid) {
      // Здесь должна быть логика формирования запроса к Робокассе
      console.log(`Инициирован платеж на сумму: ${amountNumber} ₽`);
      onSubmit(amountNumber);
      setAmount(""); // Очищаем поле после отправки
      onClose(); // Закрываем модалку
    }
  };

  // Обработчик для кнопок быстрого выбора
  const handleQuickSelect = (value) => {
    setAmount(String(value));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Пополнение баланса">
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit}>
              {/* ТЕКУЩИЙ БАЛАНС */}
              <div className={styles.balanceInfo}>
                <p>Ваш текущий баланс:</p>
                <p className={styles.currentBalance}>
                  {formatWithSpaces(currentBalance.toLocaleString("ru-RU"))} ₽
                </p>
              </div>

              {/* КНОПКИ БЫСТРОГО ВЫБОРА */}
              <div className={styles.quickSelect}>
                <p className={styles.label}>Быстрое пополнение:</p>
                <div className={styles.buttonGroup}>
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={styles.quickButton}
                      onClick={() => handleQuickSelect(val)}
                    >
                      +{val} ₽
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="amount" className={styles.label}>
                  Введите сумму пополнения (в ₽):
                </label>
                <CustomInput
                  id="amount"
                  type="number"
                  placeholder={MIN_TOPUP_AMOUNT}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${
                    !isAmountValid && amount !== "" ? styles.inputError : ""
                  }`}
                  min={MIN_TOPUP_AMOUNT}
                  step="1"
                  autoFocus
                />

                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              </div>

              {/* КНОПКА ОПЛАТЫ */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!isAmountValid}
              >
                <CreditCard size={20} />
                Оплатить{" "}
                {amountNumber > 0
                  ? `${amountNumber.toLocaleString("ru-RU")} ₽`
                  : ""}
              </button>

              {/* Уведомление о методе оплаты */}
              <p className={styles.paymentNote}>
                <Zap size={14} /> Вы будете перенаправлены на страницу Robokassa
                для выбора способа оплаты (карты, электронные деньги и др.).
              </p>
            </form>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

// Пример использования в родительском компоненте:
/*
export default function ParentComponent() {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const userBalance = 1250.50;
    
    const handleTopUpSubmit = (sum) => {
        // Здесь реальная логика вызова Robokassa
        alert(`Отправка ${sum} ₽ на Robokassa...`);
    };
    
    return (
        <>
            <button onClick={() => setIsTopUpOpen(true)}>Пополнить</button>
            <TopUpModal 
                currentBalance={userBalance} 
                isOpen={isTopUpOpen} 
                onClose={() => setIsTopUpOpen(false)}
                onSubmit={handleTopUpSubmit}
            />
        </>
    );
}
*/
