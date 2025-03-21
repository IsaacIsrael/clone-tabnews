import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  ValidationError,
} from "infra/errors";

function onNoMatchHandler(request, response) {
  const puclicErrorObjcet = new MethodNotAllowedError();
  response.status(puclicErrorObjcet.statusCode).json(puclicErrorObjcet);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const puclicErrorObjcet = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });
  console.error(puclicErrorObjcet);
  response.status(puclicErrorObjcet.statusCode).json(puclicErrorObjcet);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
