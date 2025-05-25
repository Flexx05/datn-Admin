import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";
import { IBrand } from "../../interface/brand";

const { Title } = Typography;

export const BrandShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data as IBrand | undefined;

  return (
    <Show
      isLoading={isLoading}
      canDelete={false}
      title={"Chi tiết thương hiệu"}
    >
      <Title level={5}>{"Tên thương hiệu"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Ảnh thương hiệu"}</Title>
      <img src={record?.logoURL} style={{ width: "100px" }} />
    </Show>
  );
};
