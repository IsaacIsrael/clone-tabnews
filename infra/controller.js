import { InternalServerError, MethodNotAllowedError } from "infra/errors";

function onNoMatchHandler(request, response) {
  const puclicErrorObjcet = new MethodNotAllowedError();
  response.status(puclicErrorObjcet.statusCode).json(puclicErrorObjcet);
}

function onErrorHandler(error, request, response) {
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
