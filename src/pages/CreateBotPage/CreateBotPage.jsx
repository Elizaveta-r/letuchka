import { useState } from "react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import { SliderWithImageAndText } from "../../ui/SliderWithImageAndText/SliderWithImageAndText";
import styles from "./CreateBotPage.module.scss";

import SearchFatherCommand from "../../assets/img/hint_tg_bot/search_father_command.png";
import SearchFatherInterface from "../../assets/img/hint_tg_bot/search_father_interface.png";

import CommandCreate from "../../assets/img/hint_tg_bot/command_1.png";
import TokenCommand from "../../assets/img/hint_tg_bot/token_command.png";

import CreateInterface from "../../assets/img/hint_tg_bot/create_interface.png";
import InfoInterface from "../../assets/img/hint_tg_bot/info_interface.png";
import TokenInterface from "../../assets/img/hint_tg_bot/token_interface.png";
import { useDispatch, useSelector } from "react-redux";
import { createIntegration } from "../../utils/api/actions/integrations";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners";

const stepsCommands = [
  {
    title: "Шаг 1. Найдите @BotFather",
    text: "Откройте Телеграм и найдите официального бота @BotFather. Это официальный инструмент для создания новых ботов.",
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

const stepsInterface = [
  {
    title: "Шаг 1. Откройте @BotFather",
    text: (
      <>
        Откройте Телеграм и найдите официальный бот @BotFather. Справа от имени
        нажмите кнопку <b>“Открыть”</b>.
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

export default function CreateBotPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isIntegrationLoading } = useSelector((state) => state?.integrations);

  const [mode, setMode] = useState("commands");
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
              onClick={() => setMode("commands")}
              className={`${styles.toggleButton} ${
                mode === "commands" ? styles.active : ""
              }`}
            >
              Через команды
            </button>
            <button
              onClick={() => setMode("interface")}
              className={`${styles.toggleButton} ${
                mode === "interface" ? styles.active : ""
              }`}
            >
              Через интерфейс
            </button>
          </div>

          <div className={styles.toggleDescriptions}>
            {mode === "commands" && (
              <p
                className={`${styles.toggleText} ${
                  mode === "commands" ? styles.activeText : ""
                }`}
              >
                💬 Подходит для опытных пользователей Телеграм, знакомых с
                BotFather.
              </p>
            )}
            {mode === "interface" && (
              <p
                className={`${styles.toggleText} ${
                  mode === "interface" ? styles.activeText : ""
                }`}
              >
                🧭 Простой визуальный способ без команд — всё через интерфейс.
              </p>
            )}
          </div>
        </div>

        <SliderWithImageAndText
          mode={mode}
          steps={mode === "commands" ? stepsCommands : stepsInterface}
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
