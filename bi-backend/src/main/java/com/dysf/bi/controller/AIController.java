package com.dysf.bi.controller;

import com.dysf.bi.manager.AiManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/AI")
@RestController
public class AIController {

    private final AiManager aiManager;

    public AIController(AiManager aiManager) {
        this.aiManager = aiManager;
    }

    @PostMapping("test2")
    public String tallQuestion(@RequestBody String question) {
        return aiManager.doChat(question);
    }
}