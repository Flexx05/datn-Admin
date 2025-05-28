export const resources = [
  {
    name: "blog_posts",
    list: "/blog-posts",
    create: "/blog-posts/create",
    edit: "/blog-posts/edit/:id",
    show: "/blog-posts/show/:id",
    meta: {
      canDelete: true,
    },
  },
  {
    name: "category",
    list: "/category",
    create: "/category/add",
    edit: "/category/edit/:id",
    show: "/category/show/:id",
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
    show: "/brand/show/:id",
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
];
