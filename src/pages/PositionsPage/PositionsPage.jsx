import React, { useCallback, useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import JobTitleTable from "../../modules/JobTitleTable/JobTitleTable";
import styles from "./PositionsPage.module.scss";
import DeleteConfirmationModal from "../../modules/DeleteConfirmationModal/DeleteConfirmationModal";
import EditPositionModal from "../../modules/EditPositionModal/EditPositionModal";
import { PackageMinus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPositionsList } from "../../utils/api/actions/positions";

export default function PositionsPage() {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const { positions } = useSelector((state) => state?.positions);

  const action = searchParams.get("action");

  const [visibleModal, setVisibleCreateModal] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState(null);

  const handleOpenCreateModal = useCallback(
    (id) => {
      if (id) {
        const selectedPosition = positions?.find(
          (position) => position.id === id
        );
        setSelectedPosition(selectedPosition);
      }
      setVisibleCreateModal(true);
    },
    [positions]
  );

  const handleCloseCreateModal = () => {
    setVisibleCreateModal(false);
    setSearchParams({});
    setSelectedPosition(null);
  };

  const handleConfirmDelete = (id) => {
    if (id) {
      const selectedPosition = positions?.find(
        (position) => position.id === id
      );
      setSelectedPosition(selectedPosition);
    }
    setConfirmationOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setConfirmationOpen(false);
    setSelectedPosition(null);
  };

  useEffect(() => {
    if (action === "create") {
      handleOpenCreateModal();
    }
  }, [action, handleOpenCreateModal]);

  useEffect(() => {
    dispatch(getPositionsList(1, 10));
  }, [dispatch]);

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
        positions={positions}
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
