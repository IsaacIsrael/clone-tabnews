import * as cookie from "cookie";
import session from "models/session";

import {
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "infra/errors";

function onNoMatchHandler(request, response) {
  const puclicErrorObjcet = new MethodNotAllowedError();
  response.status(puclicErrorObjcet.statusCode).json(puclicErrorObjcet);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const puclicErrorObjcet = new InternalServerError({
    cause: error,
  });
  console.error(puclicErrorObjcet);
  response.status(puclicErrorObjcet.statusCode).json(puclicErrorObjcet);
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISECONS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
