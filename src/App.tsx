import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbarProvider } from "@refinedev/kbar";

import "@refinedev/antd/dist/reset.css";

import { App as AntdApp } from "antd";
import { BrowserRouter } from "react-router";
import RefineConfig from "./config/RefineConfig";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { useAccountSocket, useNontificationSocket } from "./socket";

function App() {
  useAccountSocket();
  useNontificationSocket();
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <RefineConfig />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
