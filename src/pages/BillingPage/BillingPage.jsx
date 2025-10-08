import { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { History } from "../../modules/TabsBilling/components/History/History";
import { Overview } from "../../modules/TabsBilling/components/Overview/Overview";
import TopUpBalanceModal from "../../modules/TopUpBalanceModal/TopUpBalanceModal";
import styles from "./BillingPage.module.scss";

export const BillingPage = () => {
  const balance = "10053.75";
  const [visibleBalanceModal, setVisibleBalanceModal] = useState(false);
  const handleOpenBalanceModal = () => {
    setVisibleBalanceModal(true);
  };
  return (
    <div className={styles.container}>
      <PageTitle
        title={"Биллинг"}
        hasButton
        buttonTitle="Пополнить"
        onClick={handleOpenBalanceModal}
      />
      <Overview />
      <div className={styles.history}>
        <p>История операций:</p>
        <History />
      </div>

      <TopUpBalanceModal
        isOpen={visibleBalanceModal}
        onClose={() => setVisibleBalanceModal(false)}
        onSubmit={() => {}}
        currentBalance={balance}
      />
    </div>
  );
};
