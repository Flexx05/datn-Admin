import { ThemedLayoutV2 } from "@refinedev/antd";
import { Authenticated, ErrorComponent } from "@refinedev/core";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router";
import { CustomSider, Header } from "../components";
import { useAuth } from "../contexts/auth/AuthContext";
import {
  AttributeCreate,
  AttributeEdit,
  AttributeList,
  AttributeShow,
} from "../pages/attributes";
import { BrandCreate, BrandEdit, BrandList, BrandShow } from "../pages/brands";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "../pages/categories";
import ChatList from "../pages/chat/list";
import Messages from "../pages/chat/messages";
import ChatShow from "../pages/chat/show";
import { CommentList, CommentShow } from "../pages/comments";
import { Dashboard } from "../pages/dashboard";
import { Login } from "../pages/login";
import { OrderList } from "../pages/order/list";
import { ReturnRequestDetail } from "../pages/order/returnRequestDetail";
import { OrderShow } from "../pages/order/show";
import {
  ProductCreate,
  ProductEdit,
  ProductList,
  ProductShow,
} from "../pages/products";
import QuickChatCreate from "../pages/quick-chat/create";
import QuickChatEdit from "../pages/quick-chat/edit";
import QuickChatList from "../pages/quick-chat/list";
import { StaffList, StaffShow } from "../pages/staff";
import { UserList, UserShow } from "../pages/user";
import VoucherCreate from "../pages/voucher/create";
import VoucherEdit from "../pages/voucher/edit";
import VoucherList from "../pages/voucher/list";
import VoucherShow from "../pages/voucher/show";
import { ProtectRouter } from "./ProtectRouter";

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <div>
      <Routes>
        <Route
          element={
            <Authenticated
              key="authenticated-inner"
              fallback={<CatchAllNavigate to="/login" />}
            >
              <ThemedLayoutV2 Header={Header} Sider={CustomSider}>
                <Outlet />
              </ThemedLayoutV2>
            </Authenticated>
          }
        >
          <Route
            index
            element={
              <NavigateToResource
                resource={user?.role === "admin" ? "dashboard" : "orders"}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectRouter>
                <Dashboard />
              </ProtectRouter>
            }
          />
          <Route path="/product">
            <Route index element={<ProductList />} />
            <Route
              path="add"
              element={
                <ProtectRouter>
                  <ProductCreate />
                </ProtectRouter>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectRouter>
                  <ProductEdit />
                </ProtectRouter>
              }
            />
            <Route path="id/:id" element={<ProductShow />} />
          </Route>
          <Route path="/attribute">
            <Route index element={<AttributeList />} />
            <Route
              path="add"
              element={
                <ProtectRouter>
                  <AttributeCreate />
                </ProtectRouter>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectRouter>
                  <AttributeEdit />
                </ProtectRouter>
              }
            />
            <Route path="id/:id" element={<AttributeShow />} />
          </Route>
          <Route path="/category">
            <Route index element={<CategoryList />} />
            <Route
              path="add"
              element={
                <ProtectRouter>
                  <CategoryCreate />
                </ProtectRouter>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectRouter>
                  <CategoryEdit />
                </ProtectRouter>
              }
            />
            <Route path="id/:id" element={<CategoryShow />} />
          </Route>
          <Route path="/brand">
            <Route index element={<BrandList />} />
            <Route
              path="add"
              element={
                <ProtectRouter>
                  <BrandCreate />
                </ProtectRouter>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectRouter>
                  <BrandEdit />
                </ProtectRouter>
              }
            />
            <Route path="id/:id" element={<BrandShow />} />
          </Route>
          <Route path="/users">
            <Route index element={<UserList />} />
            <Route path="show/:id" element={<UserShow />} />
          </Route>
          <Route path="/staffs">
            <Route
              index
              element={
                <ProtectRouter>
                  <StaffList />
                </ProtectRouter>
              }
            />
            <Route
              path="show/:id"
              element={
                <ProtectRouter>
                  <StaffShow />
                </ProtectRouter>
              }
            />
          </Route>
          <Route path="/comments">
            <Route
              index
              element={
                <ProtectRouter>
                  <CommentList />
                </ProtectRouter>
              }
            />
            <Route
              path="id/:id"
              element={
                <ProtectRouter>
                  <CommentShow />
                </ProtectRouter>
              }
            />
          </Route>
          <Route path="/conversation" element={<ChatList />}>
            <Route path="id/:id" element={<ChatShow />} />
            <Route path="message/:id" element={<Messages />} />
          </Route>
          <Route path="/orders">
            <Route index element={<OrderList />} />
            <Route path="show/:id" element={<OrderShow />} />
            <Route
              path="return-requests/show/:id"
              element={<ReturnRequestDetail />}
            />
          </Route>
          <Route path="/vouchers">
            <Route
              index
              element={
                <ProtectRouter>
                  <VoucherList />
                </ProtectRouter>
              }
            />
            <Route
              path="add"
              element={
                <ProtectRouter>
                  <VoucherCreate />
                </ProtectRouter>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectRouter>
                  <VoucherEdit />
                </ProtectRouter>
              }
            />
            <Route
              path="id/:id"
              element={
                <ProtectRouter>
                  <VoucherShow />
                </ProtectRouter>
              }
            />
          </Route>
          <Route path="/quick-chat">
            <Route index element={<QuickChatList />} />
            <Route path="add" element={<QuickChatCreate />} />
            <Route path="edit/:id" element={<QuickChatEdit />} />
          </Route>
          <Route path="*" element={<ErrorComponent />} />
        </Route>
        <Route
          element={
            <Authenticated key="authenticated-outer" fallback={<Outlet />}>
              <NavigateToResource />
            </Authenticated>
          }
        >
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </div>
  );
};

export default AppRoutes;
