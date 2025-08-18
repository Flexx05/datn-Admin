/* eslint-disable @typescript-eslint/no-explicit-any */
const CreateButton = (children: string) => ({
  type: "primary" as const,
  children: children || "Thêm mới",
});

const SaveButton = (children: string, saveButtonProps: any) => ({
  type: "primary" as const,
  children: children || "Lưu",
  ...saveButtonProps,
});

export { CreateButton, SaveButton };
