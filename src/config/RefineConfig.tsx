import { useNotificationProvider } from "@refinedev/antd";
import { Refine } from "@refinedev/core";
import { RefineKbar } from "@refinedev/kbar";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import AppRoutes from "../routes";
import { authProvider } from "./authProvider";
import { resources } from "./resources";
import dataProvider from "./dataProvider";

const RefineConfig = () => {
  return (
    <div>
      <Refine
        dataProvider={dataProvider}
        notificationProvider={useNotificationProvider}
        routerProvider={routerBindings}
        authProvider={authProvider}
        resources={resources}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          useNewQueryKeys: true,
          projectId: "7rjY9V-PolHaN-iMoP0u",
        }}
      >
        <AppRoutes />
        <RefineKbar />
        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </div>
  );
};

export default RefineConfig;
