import { Header, ThemedLayoutV2, ThemedSiderV2 } from "@refinedev/antd";
import { Authenticated, ErrorComponent } from "@refinedev/core";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "../pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "../pages/category";
import { ForgotPassword } from "../pages/forgotPassword";
import { Login } from "../pages/login";
import { Register } from "../pages/register";
import {
  AttributeCreate,
  AttributeEdit,
  AttributeList,
  AttributeShow,
} from "../pages/attributes";
import { BrandCreate, BrandEdit, BrandList, BrandShow } from "../pages/brand";
import { UserList, UserShow } from "../pages/user";
import { OrderList } from "../pages/order/list";
import { OrderShow } from "../pages/order/show";

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
              >
                <Outlet />
              </ThemedLayoutV2>
            </Authenticated>
          }
        >
          <Route index element={<NavigateToResource resource="blog_posts" />} />
          <Route path="/blog-posts">
            <Route index element={<BlogPostList />} />
            <Route path="create" element={<BlogPostCreate />} />
            <Route path="edit/:id" element={<BlogPostEdit />} />
            <Route path="show/:id" element={<BlogPostShow />} />
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
            <Route path="show/:id" element={<CategoryShow />} />
          </Route>
          <Route path="/brand">
            <Route index element={<BrandList />} />
            <Route path="add" element={<BrandCreate />} />
            <Route path="edit/:id" element={<BrandEdit />} />
            <Route path="show/:id" element={<BrandShow />} />
          </Route>
          <Route path="/users">
            <Route index element={<UserList />} />
            <Route path="show/:id" element={<UserShow />} />
          </Route>
          <Route path="/orders">
            <Route index element={<OrderList />} />
            <Route path="show/:id" element={<OrderShow />} />
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
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </div>
  );
};

export default AppRoutes;
