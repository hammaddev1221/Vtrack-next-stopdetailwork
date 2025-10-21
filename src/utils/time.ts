export const setLoginTime = () => {
  const currentTime = new Date().getTime();
  localStorage.setItem("loginTime", currentTime.toString());
};
export const getLoginTime = () => {
  const loginTime = localStorage.getItem("loginTime");
  return loginTime ? parseInt(loginTime) : null;
};
