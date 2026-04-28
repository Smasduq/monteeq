"""
Monteeq Custom Exception Hierarchy
===================================
All application exceptions derive from MonteeqException so that
the global exception handler can catch and format them uniformly.

Usage:
    raise NotFoundError("Video not found", error_code="VIDEO_NOT_FOUND")
    raise ForbiddenError()           # sensible defaults
    raise VideoProcessingError("Transcoding failed")
"""
from __future__ import annotations

from typing import Optional


class MonteeqException(Exception):
    """Base exception for all Monteeq application errors."""

    status_code: int = 500
    default_detail: str = "An unexpected error occurred."
    default_error_code: str = "INTERNAL_SERVER_ERROR"

    def __init__(
        self,
        detail: Optional[str] = None,
        error_code: Optional[str] = None,
        extra: Optional[dict] = None,
    ):
        self.detail = detail or self.default_detail
        self.error_code = error_code or self.default_error_code
        self.extra = extra or {}
        super().__init__(self.detail)

    def to_dict(self) -> dict:
        payload: dict = {
            "error_code": self.error_code,
            "detail": self.detail,
            "status_code": self.status_code,
        }
        if self.extra:
            payload["extra"] = self.extra
        return payload


# ── 4xx Client Errors ────────────────────────────────────────────────────────

class BadRequestError(MonteeqException):
    status_code = 400
    default_detail = "Bad request."
    default_error_code = "BAD_REQUEST"


class UnauthorizedError(MonteeqException):
    status_code = 401
    default_detail = "Authentication required."
    default_error_code = "UNAUTHORIZED"


class ForbiddenError(MonteeqException):
    status_code = 403
    default_detail = "You do not have permission to perform this action."
    default_error_code = "FORBIDDEN"


class NotFoundError(MonteeqException):
    status_code = 404
    default_detail = "The requested resource was not found."
    default_error_code = "NOT_FOUND"


class ConflictError(MonteeqException):
    status_code = 409
    default_detail = "A conflict occurred with the current state of the resource."
    default_error_code = "CONFLICT"


class UnprocessableError(MonteeqException):
    status_code = 422
    default_detail = "The request could not be processed."
    default_error_code = "UNPROCESSABLE"


class RateLimitError(MonteeqException):
    status_code = 429
    default_detail = "Too many requests. Please slow down."
    default_error_code = "RATE_LIMITED"


# ── 5xx Server Errors ────────────────────────────────────────────────────────

class ServerError(MonteeqException):
    status_code = 500
    default_detail = "An internal server error occurred."
    default_error_code = "INTERNAL_SERVER_ERROR"


class ServiceUnavailableError(MonteeqException):
    status_code = 503
    default_detail = "The service is temporarily unavailable."
    default_error_code = "SERVICE_UNAVAILABLE"


# ── Domain-Specific Errors ───────────────────────────────────────────────────

class VideoNotFoundError(NotFoundError):
    default_detail = "Video not found."
    default_error_code = "VIDEO_NOT_FOUND"


class VideoProcessingError(ServerError):
    default_detail = "Video processing failed."
    default_error_code = "VIDEO_PROCESSING_ERROR"


class StorageError(ServerError):
    default_detail = "A storage operation failed."
    default_error_code = "STORAGE_ERROR"


class PaymentError(BadRequestError):
    default_detail = "Payment processing failed."
    default_error_code = "PAYMENT_ERROR"


class UserNotFoundError(NotFoundError):
    default_detail = "User not found."
    default_error_code = "USER_NOT_FOUND"


class AccountDeactivatedError(ForbiddenError):
    default_detail = "This account has been deactivated."
    default_error_code = "ACCOUNT_DEACTIVATED"


class InsufficientBalanceError(BadRequestError):
    default_detail = "Insufficient wallet balance."
    default_error_code = "INSUFFICIENT_BALANCE"


class ChallengeError(BadRequestError):
    default_detail = "Challenge operation failed."
    default_error_code = "CHALLENGE_ERROR"
