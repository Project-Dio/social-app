import api from "./api";

export const signup = (formData) => {
  // map your form field names to what the API expects
  const payload = {
    name: formData.fullName,
    email: formData.email,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    password: formData.password,
    rePassword: formData.confirmPassword,
  };

  // username is optional in your form, so only send it if filled
  if (formData.username) payload.username = formData.username;

  return api.post("/users/signup", payload);
};

export const signin = (formData) => {
  return api.post("/users/signin", {
    login: formData.login,
    password: formData.password,
  });
};

export const changePassword = (password, newPassword) => {
  return api.patch("/users/change-password", {
    password,
    newPassword,
  });
};

export const getMyProfile = () => {
  return api.get("/users/profile-data");
};
