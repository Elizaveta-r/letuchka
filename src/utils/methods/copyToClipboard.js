export async function copyToClipboard(text) {
  try {
    // 🧩 Современные браузеры (ПК и мобильные)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // 🔙 Фолбэк для старых браузеров и незащищённых контекстов
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    // ✅ Можно вывести уведомление
    console.log("Скопировано!");
    // или если используешь toast:
    // import { toast } from "sonner";
    // toast.success("Скопировано в буфер обмена");
  } catch (err) {
    console.error("Ошибка при копировании:", err);
    // toast.error("Не удалось скопировать");
  }
}
