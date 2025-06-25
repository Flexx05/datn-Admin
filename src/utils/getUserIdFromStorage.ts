export const getUserIdFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser._id;
    }
  } catch (error) {
    return "";
  }
};
