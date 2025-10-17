import { Info, PencilLine, Trash } from "lucide-react";
import { TelegramIcon } from "../../assets/icons/TelegramIcon";
import styles from "./IntegrationCard.module.scss";
import { useDispatch } from "react-redux";
import { setEditedIntegration } from "../../store/slices/integrationsSlice";
import Hint from "../../ui/Hint/Hint";
import ToggleSwitch from "../../ui/ToggleSwitch/ToggleSwitch";
import { useState } from "react";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { CardActions } from "../CardActions/CardActions";
import { toggleIntegrationStatus } from "../../utils/api/actions/integrations";

const getUseTypeLabel = (useType) => {
  switch (useType) {
    case "employee_interface":
      return "Интерфейс сотрудника";
    default:
      return "Неизвестно";
  }
};

const getIntegrationTypeLabel = (integrationType) => {
  switch (integrationType) {
    case "telegram_bot":
      return "Бот";
    default:
      return "Неизвестно";
  }
};

export const IntegrationCard = ({ integration, onUpdate, onDelete }) => {
  const dispatch = useDispatch();

  const [isIntegrationActive, setIsIntegrationActive] = useState(
    integration.is_active
  );

  const handleUpdate = () => {
    dispatch(setEditedIntegration(integration));
    onUpdate();
  };

  const handleToggleChange = () => {
    setIsIntegrationActive(!isIntegrationActive);
    dispatch(toggleIntegrationStatus(integration.id, !isIntegrationActive));
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerAccent} />

      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <TelegramIcon size={25} fill={"#27a7e7"} />
          <p className={styles.cardName}>{integration.name}</p>
        </div>
        <HintWithPortal
          hasIcon={false}
          hintContent="Активировать/деактивировать интеграцию"
        >
          <ToggleSwitch
            togglePosition="left"
            checked={isIntegrationActive}
            onChange={handleToggleChange}
          />
        </HintWithPortal>

        {/* <StatusPill
          isActive={integration.is_active}
          className={styles.status}
        /> */}
      </div>

      <p className={styles.description}>
        {integration.description || "Описание отсутствует"}
      </p>

      <div className={styles.cardInfo}>
        <div className={styles.info}>
          <Hint hintContent="Ваш токен интеграции" isCentered>
            <p className={styles.token}>{integration.perpetual_token}</p>
          </Hint>
        </div>
        <div className={styles.info}>
          <p className={styles.type}>
            {getIntegrationTypeLabel(integration.integration_type)}
          </p>
          <p className={styles.use}>{getUseTypeLabel(integration.use_type)}</p>
        </div>
      </div>

      <CardActions
        onDetails={handleUpdate}
        onUpdate={handleUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};
