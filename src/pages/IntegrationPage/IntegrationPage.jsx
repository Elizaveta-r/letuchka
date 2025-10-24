import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./IntegrationPage.module.scss";
import { useEffect, useState } from "react";
import {
  deleteIntegration,
  getIntegrationsList,
} from "../../utils/api/actions/integrations";
import { UpdateIntegrationModal } from "../../modules/UpdateIntegrationModal/UpdateIntegrationModal";
import { IntegrationCard } from "../../components/IntegrationCard/IntegrationCard";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import { Trash } from "lucide-react";
import { OnboardingModal } from "../../modules/OnboardingModal/OnboardingModal";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import { setEditedIntegration } from "../../store/slices/integrationsSlice";

const IntegrationPage = () => {
  const dispatch = useDispatch();

  const { integrations, isIntegrationLoading } = useSelector(
    (state) => state?.integrations
  );

  const [visibleModal, setVisibleModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [visibleConfirmationDeleteModal, setVisibleConfirmationDeleteModal] =
    useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const [visibleOnboardingModal, setVisibleOnboardingModal] = useState(false);

  const handleOpenConfirmationDeleteModal = (selectedIntegration) => {
    setSelectedIntegration(selectedIntegration);
    setVisibleConfirmationDeleteModal(true);
  };

  const handleCloseConfirmationDeleteModal = () => {
    setVisibleConfirmationDeleteModal(false);
  };

  const handleOpenCreateModal = () => {
    setVisibleModal(true);
    setIsNew(true);
  };

  const handleDeleteIntegration = () => {
    dispatch(deleteIntegration(selectedIntegration?.id)).then((res) => {
      if (res.status === 200) {
        handleCloseConfirmationDeleteModal();
      }
    });
  };

  const handleOpenUpdateModal = (integration) => {
    dispatch(setEditedIntegration(integration));
    setVisibleModal(true);
    setIsNew(false);
  };

  useEffect(() => {
    dispatch(getIntegrationsList(1, 200));
  }, [dispatch]);

  useEffect(() => {
    const checkOnboarding = () => {
      const value = sessionStorage.getItem("success_create_bot");
      if (value === "true") {
        setVisibleOnboardingModal(true);
        sessionStorage.removeItem("success_create_bot");
      }
    };

    checkOnboarding();

    window.addEventListener("storage", checkOnboarding);

    return () => {
      window.removeEventListener("storage", checkOnboarding);
    };
  }, []);

  return (
    <div className={styles.page}>
      <PageTitle
        title="Интеграции"
        hasButton
        onClick={handleOpenCreateModal}
        dataTour="integration.add"
      />
      <UpdateIntegrationModal
        isNew={isNew}
        isOpen={visibleModal}
        handleClose={() => setVisibleModal(false)}
      />
      <DeleteConfirmationModal
        isOpen={visibleConfirmationDeleteModal}
        onClose={handleCloseConfirmationDeleteModal}
        onConfirm={handleDeleteIntegration}
        message={`"Вы действительно хотите удалить интеграцию?"`}
        buttonTitle="Удалить интеграцию"
        buttonIcon={<Trash size={20} />}
        loading={isIntegrationLoading}
      />
      <OnboardingModal
        isOpen={visibleOnboardingModal}
        onClose={() => {
          setVisibleOnboardingModal(false);
          sessionStorage.removeItem("success_create_bot");
        }}
      />
      {!integrations && (
        <div className={styles.empty}>
          Список интеграций пуст. <br /> Нажмите <strong>"Добавить"</strong>,
          чтобы создать первую интеграцию.
        </div>
      )}

      {integrations && (
        <div className={styles.header}>
          <div className={styles.title}>
            <div></div>
            <div>НАЗВАНИЕ</div>
            <div>ТОКЕН БОТА</div>
            <HintWithPortal
              hintContent={`Когда бот выключен — он не получает и не отвечает на сообщения. \n\n Включите его, чтобы снова принимать обращения пользователей.`}
            >
              <div>ВЫКЛ/ВКЛ</div>
            </HintWithPortal>
          </div>
          <div className={styles.list}>
            {integrations?.map((integration) => {
              return (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onUpdate={handleOpenUpdateModal}
                  onDelete={() =>
                    handleOpenConfirmationDeleteModal(integration)
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
