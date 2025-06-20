import { AuthPage } from "@refinedev/antd";
import { TitleLogo } from "../../components";

export const Login = () => {
  return (
    <AuthPage
      registerLink={false}
      forgotPasswordLink={false}
      title={<TitleLogo collapsed={false} style={{ fontSize: 50 }} />}
      type="login"
      formProps={{
        initialValues: {
          remember: true,
        },
      }}
    />
  );
};
