export const resources = [
  {
    name: "product",
    list: "/product",
    create: "/product/add",
    edit: "/product/edit/:id",
    show: "/product/id/:id",
    meta: {
      canDelete: true,
      label: "Quản lý sản phẩm",
    },
  },
  {
    name: "category",
    list: "/category",
    create: "/category/add",
    edit: "/category/edit/:id",
    show: "/category/id/:id",
    meta: {
      canDelete: true,
      label: "Quản lý danh mục",
    },
  },
  {
    name: "brand",
    list: "/brand",
    create: "/brand/add",
    edit: "/brand/edit/:id",
    show: "/brand/id/:id",
    meta: {
      canDelete: true,
      label: "Quản lý thương hiệu",
    },
  },
  {
    name: "attribute",
    list: "/attribute",
    create: "/attribute/add",
    edit: "/attribute/edit/:id",
    show: "/attribute/id/:id",
    meta: {
      canDelete: true,
      label: "Quản lý thuộc tính",
    },
  },
  {
    name: "comments",
    list: "/comments",
    show: "/comments/id/:id",
    meta: {
      canDelete: true,
      label: "Quản lý đánh giá",
    },
  },
  {
    name: "admin/users",
    list: "/users",
    show: "/users/show/:id",
    edit: "/users/edit/:id",
    meta: {
      label: "Quản lý Khách hàng",
    },
  },
  {
    name: "orders",
    list: "/orders",
    show: "/orders/show/:id",
    meta: {
      label: "Quản lý đơn hàng",
    },
  }
];
