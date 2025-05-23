/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";
import { IAttribute } from "../../interface/attribute";

const { Title } = Typography;

export const AttributeShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data as IAttribute | undefined;

  return (
    <Show title={"Chi tiết thuộc tính"} isLoading={isLoading}>
      <Title level={5}>{"Tên thuộc tính"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Giá trị thuộc tính"}</Title>
      <TextField
        value={
          record?.isColor ? (
            <div style={{ display: "flex", gap: 4 }}>
              {record.values.map((item: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: item,
                    borderRadius: "50%",
                  }}
                ></div>
              ))}
            </div>
          ) : (
            record?.values?.map((item: string) => item).join(", ")
          )
        }
      />
    </Show>
  );
};
