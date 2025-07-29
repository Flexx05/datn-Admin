/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInvalidate, useList } from "@refinedev/core";
import { Button, message, Popover } from "antd";
import { IUser } from "../../interface/user";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
  conversationId: string;
  disabledStatus: boolean;
  buttonType?: "link" | "text" | "default" | "primary" | "dashed";
};

const AssignConversationToStaff = ({
  conversationId,
  disabledStatus,
  buttonType,
}: Props) => {
  const invalidate = useInvalidate();
  const { data } = useList<IUser>({
    resource: "staffs",
    filters: [
      {
        field: "isActive",
        operator: "eq",
        value: true,
      },
    ],
    meta: {
      _limit: "off",
    },
  });
  const staffs = data?.data || ([] as IUser[]);

  const handleAssignConversationToStaff = async (staffId: string | number) => {
    try {
      await axiosInstance.patch(
        `/conversation/assign/staff/${conversationId}`,
        {
          staffId,
        }
      );
      invalidate({
        resource: "conversation",
        id: conversationId,
        invalidates: ["list", "detail"],
      });
      message.success("Đăng ký thành công");
    } catch (error: any) {
      console.error(error);

      message.error("Lỗi khi đăng ký đoạn chat");
    }
  };

  const getPopoverContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {staffs?.map((staff: IUser) => (
        <Button
          key={staff._id}
          type="default"
          color="default"
          onClick={() => handleAssignConversationToStaff(staff._id)}
        >
          {staff.fullName || staff.email}
        </Button>
      ))}
    </div>
  );
  return (
    <>
      <Popover content={getPopoverContent} trigger="click">
        <Button type={buttonType} disabled={disabledStatus}>
          Đăng ký
        </Button>
      </Popover>
    </>
  );
};

export default AssignConversationToStaff;
