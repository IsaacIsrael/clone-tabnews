export class InternalServerError extends Error {
  constructor({ statusCode, cause }) {
    super("An unexpected internal error occurred", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Contact support";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ message, cause }) {
    super(message || "Service currently unavailable", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Check if the service is available";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Method is not allowed for this endpoint");
    this.name = "MethodNotAllowedError";
    this.action = "Check if this HTTP Method send is valid for this endpoint";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
