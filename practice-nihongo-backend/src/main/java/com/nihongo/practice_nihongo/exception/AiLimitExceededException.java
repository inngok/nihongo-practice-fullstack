package com.nihongo.practice_nihongo.exception;

public class AiLimitExceededException extends RuntimeException {
    public AiLimitExceededException(String message) {
        super(message);
    }
}
