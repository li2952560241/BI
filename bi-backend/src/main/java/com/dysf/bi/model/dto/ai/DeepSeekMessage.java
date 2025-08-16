package com.dysf.bi.model.dto.ai;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeepSeekMessage {
    private String role;
    private String content;
}