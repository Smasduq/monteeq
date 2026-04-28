"""
Monteeq Global Exception Handlers
====================================
Register all handlers with `register_exception_handlers(app)` inside main.py.

Every error response follows a consistent shape:
{
    "error_code": "SNAKE_CASE_CODE",
    "detail":     "Human-readable message",
    "status_code": 4xx | 5xx,
    "trace_id":   "uuid-for-server-logs",   # only on 5xx
    "fields":     [...]                      # only on validation errors
}
"""
from __future__ import annotations

import logging
import traceback
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import MonteeqException

logger = logging.getLogger("monteeq")


# ── Helper ────────────────────────────────────────────────────────────────────

def _json(status_code: int, body: dict) -> JSONResponse:
    return JSONResponse(status_code=status_code, content=body)


def _trace_id() -> str:
    return str(uuid.uuid4())


# ── Handlers ─────────────────────────────────────────────────────────────────

async def monteeq_exception_handler(
    request: Request, exc: MonteeqException
) -> JSONResponse:
    """Handle all custom Monteeq exceptions."""
    logger.warning(
        "MonteeqException [%s] %s — %s %s",
        exc.status_code,
        exc.error_code,
        request.method,
        request.url.path,
    )
    return _json(exc.status_code, exc.to_dict())


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Normalise FastAPI / Starlette HTTPExceptions into the standard shape."""
    # Map common status codes to Monteeq error codes
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        422: "UNPROCESSABLE",
        429: "RATE_LIMITED",
        500: "INTERNAL_SERVER_ERROR",
        503: "SERVICE_UNAVAILABLE",
    }
    error_code = code_map.get(exc.status_code, "HTTP_ERROR")

    body: dict = {
        "error_code": error_code,
        "detail": exc.detail or "An error occurred.",
        "status_code": exc.status_code,
    }
    return _json(exc.status_code, body)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Pydantic / FastAPI request-body validation errors → readable field list."""
    fields = []
    for error in exc.errors():
        loc = " → ".join(str(l) for l in error["loc"] if l != "body")
        fields.append(
            {
                "field": loc,
                "message": error["msg"],
                "type": error["type"],
            }
        )

    logger.info(
        "ValidationError on %s %s: %d field(s)",
        request.method,
        request.url.path,
        len(fields),
    )

    return _json(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        {
            "error_code": "VALIDATION_ERROR",
            "detail": "One or more fields failed validation.",
            "status_code": 422,
            "fields": fields,
        },
    )


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all for any unhandled exception — log full traceback, return 500."""
    trace_id = _trace_id()
    logger.error(
        "Unhandled exception [trace=%s] on %s %s\n%s",
        trace_id,
        request.method,
        request.url.path,
        traceback.format_exc(),
    )
    return _json(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        {
            "error_code": "INTERNAL_SERVER_ERROR",
            "detail": "An unexpected server error occurred. Our team has been notified.",
            "status_code": 500,
            "trace_id": trace_id,
        },
    )


# ── Registration ──────────────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Call this once in main.py to attach all handlers to the app."""
    app.add_exception_handler(MonteeqException, monteeq_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
