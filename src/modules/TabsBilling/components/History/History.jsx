import styles from "./History.module.scss";
import {
  convertGoDateToISO,
  formatDateLocal,
} from "../../../../utils/methods/dateFormatter";
import { formatMoneyDynamic } from "../../../../utils/methods/amountFormatter";

export const History = () => {
  const history = [
    {
      id: "a3e9c5b2-f4d1-4a7e-8c0b-6d1f2e3g4h5i",
      operation: "outcome",
      description: "Оплата тарифа 'Максимум' за ноябрь",
      reason: "subscription_fee",
      reason_id: "plan_maximum_nov",
      amount: "2990",
      balance_before: "10500",
      balance_after: "7510",
      created_at: "2025-11-01 09:00:00.000000 +0000 UTC",
    },
    {
      id: "e0c5d9a1-7c34-4b8f-897d-41a6b0c3f5d6",
      operation: "income",
      description: "Пополнение баланса",
      reason: "top_up",
      reason_id: "top_up_ref_7482",
      amount: "5000",
      balance_before: "5500",
      balance_after: "10500",
      created_at: "2025-10-30 14:30:45.000000 +0000 UTC",
    },
    {
      id: "4f1bbfac-123c-41e7-80ce-2fdb45ff340d",
      operation: "outcome",
      description: "Оплата тарифа 'Базовый' за октябрь",
      reason: "subscription_fee",
      reason_id: "plan_basic_oct",
      amount: "990",
      balance_before: "6490",
      balance_after: "5500",
      created_at: "2025-10-01 00:00:01.108976 +0000 UTC",
    },
    {
      id: "7d9e0f21-a3b4-4c6d-8e5f-1g2h3i4j5k6l",
      operation: "income",
      description: "Пополнение баланса",
      reason: "top_up",
      reason_id: "top_up_ref_9371",
      amount: "1500",
      balance_before: "4990",
      balance_after: "6490",
      created_at: "2025-09-28 16:15:00.789012 +0000 UTC",
    },
    {
      id: "b1a2c8f0-3e7b-4d56-9c4a-6f8d1e2b3c4d",
      operation: "outcome",
      description: "Комиссия за обработку транзакций (сентябрь)",
      reason: "service_fee",
      reason_id: "fee_sept_2025",
      amount: "145.50",
      balance_before: "5135.50",
      balance_after: "4990",
      created_at: "2025-09-25 10:00:00.123456 +0000 UTC",
    },
    {
      id: "c3d4e5f6-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
      operation: "income",
      description: "Пополнение баланса",
      reason: "top_up",
      reason_id: "top_up_ref_1122",
      amount: "3000",
      balance_before: "2135.50",
      balance_after: "5135.50",
      created_at: "2025-09-20 12:40:00.000000 +0000 UTC",
    },
  ];

  return (
    <div className={styles.history}>
      <div className={styles.scrollWrapper}>
        {history?.length > 0 ? (
          <>
            {[...history]
              ?.sort((a, b) => {
                const dateA = new Date(convertGoDateToISO(a.created_at));
                const dateB = new Date(convertGoDateToISO(b.created_at));
                return dateB - dateA; // сначала новые
              })
              ?.map((item, index) => {
                return (
                  <div key={`history-item-${index}`} className={styles.item}>
                    <div>{formatDateLocal(item.created_at)}</div>
                    <div>{item.description}</div>
                    <div>
                      {item.operation === "outcome" ? "-" : "+"}
                      {formatMoneyDynamic(item.amount)}
                    </div>
                  </div>
                );
              })}
          </>
        ) : (
          <div>Нет истории</div>
        )}
      </div>
    </div>
  );
};
