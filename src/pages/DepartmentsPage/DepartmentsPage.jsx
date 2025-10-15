import styles from "./DepartmentsPage.module.scss";
import DepartmentCard from "../../components/DepartmentCard/DepartmentCard";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CreateDepartmentModal from "../../modules/CreateDepartmentModal/CreateDepartmentModal";
import { useDispatch, useSelector } from "react-redux";
import {
  createDepartment,
  getDepartmentById,
  getDepartmentsList,
  updateDepartment,
} from "../../utils/api/actions/departments";
import {
  setDepartment,
  setLoadingGetDetails,
} from "../../store/slices/departmentsSlice";

export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { departments } = useSelector((state) => state?.departments);

  const [visibleCreateModal, setVisibleCreateModal] = useState(false);
  const [visibleUpdateModal, setVisibleUpdateModal] = useState(false);

  const handleDetails = (id) => {
    dispatch(setLoadingGetDetails(id));
    dispatch(getDepartmentById(id)).then(() => {
      navigate(`${id}`);
    });
  };

  const handleOpenUpdateModal = (id) => {
    dispatch(getDepartmentById(id));
    setVisibleUpdateModal(true);
  };

  const handleCreateDepartment = (data) => {
    const dataForServer = {
      name: data?.name,
      description: data?.description,
      timezone: data?.timeZone.value,
      check_in_time: data?.checkInTime,
      check_out_time: data?.checkOutTime,
    };

    return dispatch(createDepartment(dataForServer));
  };

  const handleUpdateDepartment = (data) => {
    const dataForServer = {
      department_id: data?.id,
      name: data?.name,
      description: data?.description,
      timezone: data?.timeZone.value,
      check_in_time: data?.checkInTime,
      check_out_time: data?.checkOutTime,
    };

    return dispatch(updateDepartment(dataForServer));
  };

  const handleCreateClose = () => {
    setVisibleCreateModal(false);
  };

  const handleUpdateClose = () => {
    dispatch(setDepartment(null));
    setVisibleUpdateModal(false);
  };

  useEffect(() => {
    dispatch(getDepartmentsList(1, 10));
  }, [dispatch]);

  return (
    <div className={styles.pageContent}>
      <PageTitle
        title="Ваши подразделения"
        hasButton
        onClick={() => setVisibleCreateModal(true)}
      />
      <CreateDepartmentModal
        isOpen={visibleCreateModal || visibleUpdateModal}
        onClose={() =>
          visibleCreateModal ? handleCreateClose() : handleUpdateClose()
        }
        onConfirm={handleCreateDepartment}
        onUpdate={handleUpdateDepartment}
      />

      {!departments && (
        <div className={styles.empty}>
          Список подразделений пуст. <br /> Нажмите <strong>"Добавить"</strong>,
          чтобы создать первое подразделение.
        </div>
      )}

      {departments && (
        <div className={styles.content}>
          {departments.map((department, index) => (
            <DepartmentCard
              key={index}
              {...department}
              onDetailsClick={() => handleDetails(department.id)}
              onUpdateClick={handleOpenUpdateModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
