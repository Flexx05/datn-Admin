import { ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/antd";
import { Authenticated, ErrorComponent } from "@refinedev/core";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router";
import { Header, TitleLogo } from "../components";
import {
  AttributeCreate,
  AttributeEdit,
  AttributeList,
  AttributeShow,
} from "../pages/attributes";
import { CommentList, CommentShow } from "../pages/comments";
import { BrandCreate, BrandEdit, BrandList, BrandShow } from "../pages/brands";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "../pages/categories";
import { Login } from "../pages/login";
import {
  ProductCreate,
  ProductEdit,
  ProductList,
  ProductShow,
} from "../pages/products";
import { UserList, UserShow } from "../pages/user";
import { OrderList } from "../pages/order/list";
import { OrderShow } from "../pages/order/show";
import { Dashboard } from "../pages/dashboard";
import VoucherList from "../pages/voucher/list";
import VoucherCreate from "../pages/voucher/create";
import VoucherEdit from "../pages/voucher/edit";
import VoucherShow from "../pages/voucher/show";
import TopProductsStatistics from "../pages/statistics/top-products";
import RevenueOrdersStatistics from "../pages/statistics/order-statistics";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route
          element={
            <Authenticated
              key="authenticated-inner"
              fallback={<CatchAllNavigate to="/login" />}
            >
              <ThemedLayoutV2
                Header={Header}
                Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                Title={({ collapsed }) => <TitleLogo collapsed={collapsed} />}
              >
                <Outlet />
              </ThemedLayoutV2>
            </Authenticated>
          }
        >
          <Route index element={<NavigateToResource resource="dashboard" />} />
          <Route path="/dashboard">
            <Route index element={<Dashboard />} />
          </Route>
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
          <Route path="/comments">
            <Route index element={<CommentList />} />
            <Route path="id/:id" element={<CommentShow />} />
          </Route>
          <Route path="/orders">
            <Route index element={<OrderList />} />
            <Route path="show/:id" element={<OrderShow />} />
          </Route>
          <Route path="*" element={<ErrorComponent />} />
          <Route path="/vouchers">
            <Route index element={<VoucherList />} />
            <Route path="add" element={<VoucherCreate />} />
            <Route path="edit/:id" element={<VoucherEdit />} />
            <Route path="id/:id" element={<VoucherShow />} />
          </Route>
          <Route path="/statistics/top-products">
            <Route index element={<TopProductsStatistics />} />
          </Route>
          <Route path="/statistics/order-revenue">
            <Route index element={<RevenueOrdersStatistics />} />
          </Route>
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
