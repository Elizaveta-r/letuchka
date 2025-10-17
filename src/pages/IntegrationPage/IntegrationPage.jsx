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

  const handleOpenUpdateModal = () => {
    setVisibleModal(true);
    setIsNew(false);
  };

  useEffect(() => {
    dispatch(getIntegrationsList(1, 200));
  }, [dispatch]);

  return (
    <div className={styles.page}>
      <PageTitle title="Интеграции" hasButton onClick={handleOpenCreateModal} />
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
      {!integrations && (
        <div className={styles.empty}>
          Список интеграций пуст. <br /> Нажмите <strong>"Добавить"</strong>,
          чтобы создать первую интеграцию.
        </div>
      )}

      {integrations && (
        <div className={styles.list}>
          {integrations?.map((integration) => {
            return (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onUpdate={handleOpenUpdateModal}
                onDelete={() => handleOpenConfirmationDeleteModal(integration)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
