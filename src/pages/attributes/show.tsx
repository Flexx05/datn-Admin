/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const AttributeShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show title={"Chi tiết thuộc tính"} isLoading={isLoading}>
      <Title level={5}>{"Tên thuộc tính"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Giá trị thuộc tính"}</Title>
      <TextField
        value={record?.values?.map((item: string) => item).join(", ")}
      />
    </Show>
  );
};
