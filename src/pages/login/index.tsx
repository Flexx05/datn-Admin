import { AuthPage } from "@refinedev/antd";

export const Login = () => {
  return (
    <AuthPage
      registerLink={false}
      forgotPasswordLink={false}
      title={
        <>
          <img src="/logofull.png" width={150} />
        </>
      }
      type="login"
      formProps={{
        initialValues: {
          remember: true,
        },
      }}
    />
  );
};
