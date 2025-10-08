import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";
import Logo from "../Logo/Logo";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>
        <Logo />
      </div>
      {/* <div className={styles.infoContainer}>
        <div className={styles.sections}>
          <p>Разделы</p>
          {isLoggedIn ? (
            <div className={styles.sectionWrapper}>
              <Link to="/billing">Биллинг</Link>
              <Link to="/">Провайдеры</Link>
              <Link to="/api-keys">API Ключи</Link>
              <Link to="/statistics">Статистика</Link>
              <Link to="/n8n/manage?tab=servers">n8n</Link>
              <Link to="/creator">Я автор</Link>
              <Link to="/n8n/marketplace">Маркетплейс</Link>
              <Link to="/settings">Настройки</Link>
            </div>
          ) : (
            <div className={styles.sectionWrapper}>
              <Link to="/auth">Войти</Link>
              <Link to="/reg">Зарегистрироваться</Link>
            </div>
          )}
        </div>
        <div className={styles.contacts}>
          <p>Контакты</p>
          <div className={styles.contactsWrapper}>
            <a href="tel:88005553144">8 800 555 31 44</a>
            <a href="tel:84951202944">8 (495) 120-29-44</a>
            <a href="tel:83652777127">8 (3652) 777-127</a>
            <a href="tel:89788600085">8 (978) 86-000-85</a>
            <a href="mailto:sale@tab-is.ru">sale@tab-is.ru</a>
          </div>
        </div>
        <div className={styles.address}>
          <p>Адрес</p>
          <div className={styles.addressWrapper}>
            <div>
              Офис в Москве: 109147, Россия, Москва. ул. Талалихина, дом № 2/1,
              корпус 1, помещение 2П Ком 1
            </div>
            <div>
              Офис в Крыму: 295000, Россия, Симферополь, ул. Крымской Правды 63Б
            </div>
          </div>
        </div>
        <div className={styles.social}>
          <p>Социальные сети</p>
          <div className={styles.socialWrapper}>
            <a href="https://t.me/ai_makers_ru" target="_blank">
              <TelegramIcon size={15} fill={"#666666"} />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </div> */}
      <div className={styles.copyrightContainer}>
        <div className={styles.links}>
          <Link to="/terms-of-use">Условия использования</Link>
          <Link to="/privacy-policy">Политика конфиденциальности</Link>
        </div>
        <p>© {year}, ГК "Технологии и бизнес"</p>
      </div>
    </footer>
  );
};
