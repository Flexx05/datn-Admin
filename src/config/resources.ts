export const resources = [
  {
    name: "dashboard",
    list: "/dashboard",
    meta: {
      label: "Trang chủ",
      icon: "dashboard",
    },
  },
  {
    name: "product",
    list: "/product",
    create: "/product/add",
    edit: "/product/edit/:id",
    show: "/product/id/:id",
    meta: {
      label: "Quản lý sản phẩm",
      icon: "product",
    },
  },
  {
    name: "category",
    list: "/category",
    create: "/category/add",
    edit: "/category/edit/:id",
    show: "/category/id/:id",
    meta: {
      label: "Quản lý danh mục",
      icon: "category",
    },
  },
  {
    name: "brand",
    list: "/brand",
    create: "/brand/add",
    edit: "/brand/edit/:id",
    show: "/brand/id/:id",
    meta: {
      label: "Quản lý thương hiệu",
      icon: "brand",
    },
  },
  {
    name: "attribute",
    list: "/attribute",
    create: "/attribute/add",
    edit: "/attribute/edit/:id",
    show: "/attribute/id/:id",
    meta: {
      label: "Quản lý thuộc tính",
      icon: "attribute",
    },
  },
  {
    name: "comments",
    list: "/comments",
    show: "/comments/id/:id",
    meta: {
      label: "Quản lý đánh giá",
      icon: "comment",
    },
  },
  {
    name: "admin/users",
    list: "/users",
    show: "/users/show/:id",
    meta: {
      label: "Quản lý khách hàng",
      icon: "user",
    },
  },
  {
    name: "staffs",
    list: "/staffs",
    show: "/staffs/show/:id",
    meta: {
      label: "Quản lý nhân viên",
      icon: "staff",
    },
  },
  {
    name: "orders",
    list: "/orders",
    show: "/orders/show/:id",
    returnRequests: "/orders/return-requests/show/:id",
    meta: {
      label: "Quản lý đơn hàng",
      icon: "order",
    },
  },
  {
    name: "vouchers",
    list: "/vouchers",
    create: "/vouchers/add",
    edit: "/vouchers/edit/:id",
    show: "/vouchers/id/:id",
    meta: {
      label: "Quản lý voucher",
      icon: "voucher",
    },
  },
  {
    name: "conversation",
    list: "/conversation",
    show: "/conversation/id/:id",
    meta: {
      label: "Chăm sóc khách hàng",
      icon: "conversation",
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
      icon: "quick-chat",
    },
  },
];
