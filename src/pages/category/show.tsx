import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";
import { ICategory } from "../../interface/category";

const { Title } = Typography;

export const CategoryShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data as ICategory | undefined;

  return (
    <Show isLoading={isLoading} canDelete={false}>
      <Title level={5}>{"Tên danh mục"}</Title>
      <TextField value={record?.name} />
      {record?.parentId === null && (
        <>
          <Title level={5}>{"Danh mục con"}</Title>
          <TextField
            value={record?.subCategories
              ?.map((item: ICategory) => item.name)
              .join(", ")}
          />
        </>
      )}
    </Show>
  );
};
