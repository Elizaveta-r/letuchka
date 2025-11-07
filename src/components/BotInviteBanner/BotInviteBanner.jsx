import { Copy, X } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "../../utils/methods/copyToClipboard";
import styles from "./BotInviteBanner.module.scss";

export const BotInviteBanner = ({ integration, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const botLink = `https://t.me/${integration.title.replace(/^@/, "")}`;

    copyToClipboard(botLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.text}>
            Отправьте сотрудникам ссылку на бота — они автоматически добавятся в
            систему после нажатия <strong>«Старт»</strong> в Telegram.
          </p>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.linkBox}>
          <span className={styles.link}>
            t.me/{integration.title.replace(/^@/, "") || "ваш_бот"}
          </span>
          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "Скопировано ✅" : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
