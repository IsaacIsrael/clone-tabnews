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

export class ValidationError extends Error {
  constructor({ message, cause, action }) {
    super(message || "A validation error occurred", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Adjust the submitted data and try again.";
    this.statusCode = 400;
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

export class NotFoundError extends Error {
  constructor({ message, cause, action }) {
    super(message || "This resource could not be found in the system", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action || "Check if the parameters sent in the query are correct";
    this.statusCode = 404;
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
