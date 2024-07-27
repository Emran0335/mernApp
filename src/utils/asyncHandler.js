const asyncHandler = (requestedHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestedHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};


export default asyncHandler;