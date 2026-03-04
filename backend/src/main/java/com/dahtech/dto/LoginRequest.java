// ============================================================
// Auth DTOs
// ============================================================
package com.dahtech.dto;

import jakarta.validation.constraints.NotBlank;

// ── Login Request ─────────────────────────────────────────────
public record LoginRequest(
    @NotBlank(message = "Username is required") String username,
    @NotBlank(message = "Password is required") String password
) {}
