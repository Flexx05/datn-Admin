import { ThemedLayoutV2 } from "@refinedev/antd";
import { Authenticated, ErrorComponent } from "@refinedev/core";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router";
import { CustomSider, Header } from "../components";
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
import { useAuth } from "../contexts/auth/AuthContext";

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
                resource={user?.role === "admin" ? "dashboard" : "product"}
              />
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product">
            <Route index element={<ProductList />} />
            <Route path="add" element={<ProductCreate />} />
            <Route path="edit/:id" element={<ProductEdit />} />
            <Route path="id/:id" element={<ProductShow />} />
          </Route>
          <Route path="/attribute">
            <Route index element={<AttributeList />} />
            <Route path="add" element={<AttributeCreate />} />
            <Route path="edit/:id" element={<AttributeEdit />} />
            <Route path="id/:id" element={<AttributeShow />} />
          </Route>
          <Route path="/category">
            <Route index element={<CategoryList />} />
            <Route path="add" element={<CategoryCreate />} />
            <Route path="edit/:id" element={<CategoryEdit />} />
            <Route path="id/:id" element={<CategoryShow />} />
          </Route>
          <Route path="/brand">
            <Route index element={<BrandList />} />
            <Route path="add" element={<BrandCreate />} />
            <Route path="edit/:id" element={<BrandEdit />} />
            <Route path="id/:id" element={<BrandShow />} />
          </Route>
          <Route path="/users">
            <Route index element={<UserList />} />
            <Route path="show/:id" element={<UserShow />} />
          </Route>
          <Route path="/staffs">
            <Route index element={<StaffList />} />
            <Route path="show/:id" element={<StaffShow />} />
          </Route>
          <Route path="/comments">
            <Route index element={<CommentList />} />
            <Route path="id/:id" element={<CommentShow />} />
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
            <Route index element={<VoucherList />} />
            <Route path="add" element={<VoucherCreate />} />
            <Route path="edit/:id" element={<VoucherEdit />} />
            <Route path="id/:id" element={<VoucherShow />} />
          </Route>
          <Route path="/quick-chat">
            <Route index element={<QuickChatList />} />
            <Route path="add" element={<QuickChatCreate />} />
            <Route path="edit/:id" element={<QuickChatEdit />} />
          </Route>
          {/* Cấm xóa */}
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
