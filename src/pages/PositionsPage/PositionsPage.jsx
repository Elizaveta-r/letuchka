import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import JobTitleTable from "../../modules/JobTitleTable/JobTitleTable";
import styles from "./PositionsPage.module.scss";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import EditPositionModal from "../../modules/EditPositionModal/EditPositionModal";
import { Briefcase, PackageMinus } from "lucide-react";

const positions = [
  {
    id: 1,
    name: "Повар",
    description:
      "Отвечает за полный цикл приготовления блюд горячего и холодного цехов, контролирует качество сырья",
    employeeCount: 5,
  },
  {
    id: 2,
    name: "Администратор",
    description:
      "Осуществляет контроль работы зала, встречает гостей, решает конфликтные ситуации, ведет отчетность",
    employeeCount: 2,
  },
  {
    id: 3,
    name: "Курьер",
    description:
      "Своевременная доставка заказов клиентам, работа с мобильным приложением и навигацией",
    employeeCount: 8,
  },
  {
    id: 4,
    name: "Руководитель разработки",
    description:
      "Управление командой, принятие архитектурных решений, код-ревью",
    employeeCount: 0,
  },
];

export default function PositionsPage() {
  const [visibleModal, setVisibleCreateModal] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState(null);

  const handleOpenCreateModal = (id) => {
    if (id) {
      const selectedPosition = positions.find((position) => position.id === id);
      setSelectedPosition(selectedPosition);
    }
    setVisibleCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setVisibleCreateModal(false);
    setSelectedPosition(null);
  };

  const handleConfirmDelete = (id) => {
    if (id) {
      const selectedPosition = positions.find((position) => position.id === id);
      setSelectedPosition(selectedPosition);
    }
    setConfirmationOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setConfirmationOpen(false);
    setSelectedPosition(null);
  };

  return (
    <div className={styles.container}>
      <DeleteConfirmationModal
        message={<Message positionName={selectedPosition?.name} />}
        isOpen={isConfirmationOpen}
        onClose={handleConfirmDeleteClose}
        buttonTitle="Удалить"
        buttonIcon={<PackageMinus size={20} />}
      />
      <EditPositionModal
        isOpen={visibleModal}
        onClose={handleCloseCreateModal}
        position={selectedPosition}
      />
      <PageTitle
        title={"Должности"}
        hasButton
        onClick={handleOpenCreateModal}
      />
      <JobTitleTable
        onEdit={handleOpenCreateModal}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}

const Message = ({ positionName }) => {
  return (
    <div>
      <p>
        Вы действительно хотите удалить должность{" "}
        <strong>{positionName}</strong>?
      </p>
    </div>
  );
};
