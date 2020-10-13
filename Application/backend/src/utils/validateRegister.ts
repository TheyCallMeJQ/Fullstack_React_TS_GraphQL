import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export default function validateRegister(input: UsernamePasswordInput) {
  //Primitive email check
  if (!input.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email provided.",
      },
    ];
  }

  if (input.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Length of provided username must be greater than 2.",
      },
    ];
  }
  if (input.password.length <= 3) {
    return [
      {
        field: "password",
        message: "Length of provided password must be greater than 3.",
      },
    ];
  }

  if (input.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Cannot include an '@' symbol in the username!",
      },
    ];
  }

  return null;
}
