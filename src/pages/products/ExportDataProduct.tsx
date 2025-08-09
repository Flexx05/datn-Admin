import { useSelect } from "@refinedev/core";
import { Button, message, Modal, Select, Space } from "antd";
import { useMemo, useState } from "react";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import { axiosInstance } from "../../utils/axiosInstance";
import Loader from "../../utils/loading";

const ExportDataProduct = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    isActive: undefined,
    categoryId: [],
    brandId: [],
  });

  const { queryResult: category } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
    meta: {
      _limit: "off",
    },
  });

  const { queryResult: brand } = useSelect({
    resource: "brand",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
    meta: {
      _limit: "off",
    },
  });

  const allCategories = useMemo(
    () => (category?.data?.data as ICategory[]) || [],
    [category?.data?.data]
  );

  const allBrands = useMemo(
    () => (brand?.data?.data as IBrand[]) || [],
    [brand?.data?.data]
  );

  const categoryOptions = useMemo(() => {
    // Lấy tất cả danh mục con từ subCategories
    const subCategories = allCategories.flatMap(
      (cat) => cat.subCategories || []
    );
    // Gộp tất cả danh mục con vào một mảng
    return subCategories
      .filter((item) => item.isActive)
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allCategories]);

  const brandOptions = useMemo(() => {
    return allBrands
      .filter((item: IBrand) => item.isActive)
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allBrands]);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/product/export", {
        params: filters,
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "danh_sach_san_pham.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
      setIsModalOpen(false);
      setFilters({ isActive: undefined, categoryId: [], brandId: [] });
    } catch (error) {
      message.error("Lỗi khi xuất dữ liệu sản phẩm");
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Xuất dữ liệu sản phẩm
      </Button>
      <Modal
        title="Xuất dữ liệu sản phẩm"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="export"
            type="primary"
            onClick={handleExport}
            loading={loading}
          >
            Xuất
          </Button>,
        ]}
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            <Space direction="vertical" style={{ width: "100%" }}></Space>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn trạng thái"
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, isActive: value }))
              }
            >
              <Select.Option value={true}>Hoạt động</Select.Option>
              <Select.Option value={false}>Không hoạt động</Select.Option>
            </Select>

            <Select
              loading={category?.isLoading}
              options={categoryOptions}
              placeholder="Chọn danh mục"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, categoryId: value }))
              }
            />

            <Select
              loading={brand?.isLoading}
              options={brandOptions}
              placeholder="Chọn thương hiệu"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, brandId: value }))
              }
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default ExportDataProduct;
