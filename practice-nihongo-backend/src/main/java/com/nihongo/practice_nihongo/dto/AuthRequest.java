package com.nihongo.practice_nihongo.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
