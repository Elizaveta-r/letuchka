import { useState } from "react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import { SliderWithImageAndText } from "../../ui/SliderWithImageAndText/SliderWithImageAndText";
import styles from "./CreateBotPage.module.scss";

import SearchFatherCommand from "../../assets/img/hint_tg_bot/search_father_command.png";
import SearchFatherInterface from "../../assets/img/hint_tg_bot/search_father_interface.png";

import SearchFatherMobile from "../../assets/img/hint_tg_bot/mobile/botfather.PNG";

import CommandCreate from "../../assets/img/hint_tg_bot/command_1.png";
import TokenCommand from "../../assets/img/hint_tg_bot/token_command.png";

import CreateInterface from "../../assets/img/hint_tg_bot/create_interface.png";
import InfoInterface from "../../assets/img/hint_tg_bot/info_interface.png";
import TokenInterface from "../../assets/img/hint_tg_bot/token_interface.png";

import CommandsMobile from "../../assets/img/hint_tg_bot/mobile/command/1.PNG";
import TokenMobile from "../../assets/img/hint_tg_bot/mobile/command/2.PNG";

import CreateInterfaceMobile from "../../assets/img/hint_tg_bot/mobile/interface/1.PNG";
import InfoInterfaceMobile from "../../assets/img/hint_tg_bot/mobile/interface/2.PNG";
import TokenInterfaceMobile from "../../assets/img/hint_tg_bot/mobile/interface/3.PNG";

import { useDispatch, useSelector } from "react-redux";
import { createIntegration } from "../../utils/api/actions/integrations";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { useMediaQuery } from "react-responsive";

const stepsCommands = [
  {
    title: (
      <>
        Шаг 1. Найдите{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Откройте Телеграм и найдите официального бота{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
        . Это официальный инструмент для создания новых ботов.
      </>
    ),
    image: SearchFatherCommand,
  },
  {
    title: "Шаг 2. Создайте нового бота",
    text: "Нажмите /newbot и следуйте инструкциям: введите имя и уникальный username, который должен заканчиваться на 'bot'.",
    image: CommandCreate,
  },
  {
    title: "Шаг 3. Получите токен доступа",
    text: "После создания BotFather пришлёт вам токен API — скопируйте его и вставьте в поле ниже. С ним ваш бот сможет подключаться к системе.",
    image: TokenCommand,
  },
];

const stepsCommandMobile = [
  {
    title: (
      <>
        Шаг 1. Найдите{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Откройте Телеграм и найдите официального бота{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather{" "}
        </a>
        . Это официальный инструмент для создания новых ботов.
      </>
    ),
    image: SearchFatherMobile,
  },
  {
    title: "Шаг 2. Создайте нового бота",
    text: "Нажмите /newbot и следуйте инструкциям: введите имя и уникальный username, который должен заканчиваться на 'bot'.",
    image: CommandsMobile,
  },
  {
    title: "Шаг 3. Получите токен доступа",
    text: "После создания BotFather пришлёт вам токен API — скопируйте его и вставьте в поле ниже. С ним ваш бот сможет подключаться к системе.",
    image: TokenMobile,
  },
];

const stepsInterface = [
  {
    title: (
      <>
        Шаг 1. Откройте{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Откройте Телеграм и найдите официальный бот{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather{" "}
        </a>
        . Справа от имени нажмите кнопку <b>“Открыть”</b>.
      </>
    ),
    image: SearchFatherInterface,
  },
  {
    title: "Шаг 2. Создайте бота",
    text: (
      <>
        В списке ваших ботов нажмите кнопку <b>“Create a New Bot”</b>.
      </>
    ),
    image: CreateInterface,
  },
  {
    title: "Шаг 3. Укажите информацию о боте",
    text: (
      <>
        Введите название вашего бота (например, “Бот компании”) и придумайте
        уникальный username, который должен заканчиваться на <b>bot</b> —
        например, <b>mycompany_bot</b>. После этого нажмите <b>“Create Bot”</b>.
      </>
    ),
    image: InfoInterface,
  },
  {
    title: "Шаг 4. Скопируйте токен доступа",
    text: (
      <>
        После создания бота BotFather покажет страницу с настройками. Нажмите
        кнопку <b>“Copy”</b> рядом с токеном — скопируйте его и вставьте в поле
        ниже.
      </>
    ),
    image: TokenInterface,
  },
];

const stepsInterfaceMobile = [
  {
    title: (
      <>
        Шаг 1. Откройте{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather
        </a>
      </>
    ),
    text: (
      <>
        Откройте Телеграм и найдите официальный бот{" "}
        <a href="https://t.me/BotFather" target="_blank">
          @BotFather{" "}
        </a>
        . Справа от имени нажмите кнопку <b>“Открыть”</b>.
      </>
    ),
    image: SearchFatherMobile,
  },
  {
    title: "Шаг 2. Создайте бота",
    text: (
      <>
        В списке ваших ботов нажмите кнопку <b>“Create a New Bot”</b>.
      </>
    ),
    image: CreateInterfaceMobile,
  },
  {
    title: "Шаг 3. Укажите информацию о боте",
    text: (
      <>
        Введите название вашего бота (например, “Бот компании”) и придумайте
        уникальный username, который должен заканчиваться на <b>bot</b> —
        например, <b>mycompany_bot</b>. После этого нажмите <b>“Create Bot”</b>.
      </>
    ),
    image: InfoInterfaceMobile,
  },
  {
    title: "Шаг 4. Скопируйте токен доступа",
    text: (
      <>
        После создания бота BotFather покажет страницу с настройками. Нажмите
        кнопку <b>“Copy”</b> рядом с токеном — скопируйте его и вставьте в поле
        ниже.
      </>
    ),
    image: TokenInterfaceMobile,
  },
];

export default function CreateBotPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const { isIntegrationLoading } = useSelector((state) => state?.integrations);

  const [mode, setMode] = useState("interface");
  const [token, setToken] = useState("");

  const handleCreate = () => {
    let data = {
      title: "",
      description: "",
      use_type: "employee_interface",
      integration_type: "telegram_bot",
      perpetual_token: token,
    };
    dispatch(createIntegration(data)).then((res) => {
      if (res.status === 200) {
        navigate("/integrations");
        sessionStorage.removeItem("success_registration");
        localStorage.removeItem("hasIntegrations");
        sessionStorage.setItem("success_create_bot", true);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>Создайте Телеграм бота для вашего бизнеса</h1>
        <p className={styles.subtitle}>
          Чтобы начать использовать <b>ИИ в вашем бизнесе</b>, создайте
          собственного бота. Следуйте шагам ниже — всё просто!
        </p>

        <div className={styles.toggleSection}>
          <div className={styles.toggleWrapper}>
            <button
              onClick={() => setMode("interface")}
              className={`${styles.toggleButton} ${
                mode === "interface" ? styles.active : ""
              }`}
            >
              Простой способ (через интерфейс)
            </button>
            <button
              onClick={() => setMode("commands")}
              className={`${styles.toggleButton} ${
                mode === "commands" ? styles.active : ""
              }`}
            >
              Ручной способ (через команды)
            </button>
          </div>

          <div className={styles.toggleDescriptions}>
            {mode === "commands" && (
              <p
                className={`${styles.toggleText} ${
                  mode === "commands" ? styles.activeText : ""
                }`}
              >
                💬 Подходит тем, кто уже работал с BotFather и знает, как
                вручную настраивать бота через команды.
              </p>
            )}
            {mode === "interface" && (
              <p
                className={`${styles.toggleText} ${
                  mode === "interface" ? styles.activeText : ""
                }`}
              >
                🧭 Упрощённый способ с кнопками и формами — без команд и ручного
                ввода.
              </p>
            )}
          </div>
          {mode === "interface" && (
            <p className={styles.warning}>
              ⚠️ Интерфейс может быть недоступен в старых версиях Telegram. В
              этом случае используйте ручной способ.
            </p>
          )}
        </div>

        <SliderWithImageAndText
          mode={mode}
          steps={
            mode === "commands"
              ? isMobile
                ? stepsCommandMobile
                : stepsCommands
              : isMobile
              ? stepsInterfaceMobile
              : stepsInterface
          }
        />

        <form className={styles.form} id="input-token">
          <label>Токен бота:</label>
          <CustomInput
            type="text"
            placeholder="Введите токен от BotFather"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <button
            type="submit"
            className={styles.button}
            onClick={handleCreate}
            disabled={isIntegrationLoading}
          >
            {isIntegrationLoading && <RingLoader size={18} color="#fff" />}
            {isIntegrationLoading ? "Создание..." : "Создать бота"}
          </button>
        </form>
      </div>
    </div>
  );
}
