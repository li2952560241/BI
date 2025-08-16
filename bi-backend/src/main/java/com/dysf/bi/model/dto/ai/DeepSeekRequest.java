package com.dysf.bi.model.dto.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DeepSeekRequest {
    private String model;
    private List<DeepSeekMessage> messages;
}