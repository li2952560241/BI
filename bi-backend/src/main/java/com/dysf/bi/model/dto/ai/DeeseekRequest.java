package com.dysf.bi.model.dto.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DeeseekRequest {
    private String model;
    private List<Message> messages;
 
    @Data
    @Builder
    public static class Message {
        private String role;
        private String content;
    }
}