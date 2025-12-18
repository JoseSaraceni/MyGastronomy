export const ok = (body) => {
  return {
    sucess: true,
    statusCode: 200,
    body: body,
  };
};

export const notFound = (body) => {
  return {
    sucess: false,
    statusCode: 400,
    body: "Not found",
  };
};

export const serverError = (error) => {
  return {
    sucess: false,
    statusCode: 500,
    body: error,
  };
};
