/* eslint-disable max-classes-per-file */

import type { ApiError } from '../types/api';

export class AppApiError extends Error {
  public statusCode: number;

  public error: string;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'AppApiError';
    this.statusCode = apiError.statusCode;
    this.error = apiError.error;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network error');
    this.name = 'NetworkError';
  }
}

export class UnauthorizedError extends AppApiError {
  constructor(apiError: ApiError) {
    super(apiError);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppApiError {
  constructor(apiError: ApiError) {
    super(apiError);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppApiError {
  constructor(apiError: ApiError) {
    super(apiError);
    this.name = 'ValidationError';
  }
}
