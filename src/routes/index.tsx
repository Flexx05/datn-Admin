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
import { UserEdit } from "../pages/user/edit";

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
          <Route index element={<NavigateToResource resource="product" />} />
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
            <Route path="edit/:id" element={<UserEdit />} />
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
