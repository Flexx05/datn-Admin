export const resources = [
  {
    name: "dashboard",
    list: "/dashboard",
    meta: {
      label: "Trang chủ",
    },
  },
  {
    name: "top-products-statistics",
    list: "/statistics/top-products",
    meta: {
      label: "Thống kê sản phẩm bán chạy",
    },
  },
  {
    name: "order-revenue-statistics",
    list: "/statistics/order-revenue",
    meta: {
      label: "Thống kê doanh thu đơn hàng",
    },
  },
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
  },
  {
    name: "vouchers",
    list: "/vouchers",
    create: "/vouchers/add",
    edit: "/vouchers/edit/:id",
    show: "/vouchers/id/:id",
    meta: {
      canDelete: true,
      label: "Quản lý voucher",
    },
  },
  {
    name: "conversation",
    list: "/conversation",
    show: "/conversation/id/:id",
    meta: {
      label: "Chăm sóc khách hàng",
    },
  },
  {
    name: "quick-chat",
    list: "/quick-chat",
    show: "/quick-chat/id/:id",
    create: "/quick-chat/add",
    edit: "/quick-chat/edit/:id",
    meta: {
      label: "Quản lý tin nhắn nhanh",
    },
  },
];
