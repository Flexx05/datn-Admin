/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

type Props = {
  record: any;
};

const ButtonChat = ({ record }: Props) => {
  return (
    <>
      <Tooltip title="Chat với khách hàng">
        <Button
          size="small"
          icon={<MessageOutlined />}
          onClick={() => {
            console.log(`${record._id}`);
          }}
        >
          Chat
        </Button>
      </Tooltip>
    </>
  );
};

export default ButtonChat;
