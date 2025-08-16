package com.dysf.bi.utils;


import com.dysf.bi.model.dto.ai.DeepSeekMessage;
import com.dysf.bi.model.dto.ai.DeepSeekRequest;
import com.google.gson.Gson;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class DeepSeekClientUtils {

    private final String endpoint;
    private final String apiKey;
    private final Gson gson = new Gson();

    public DeepSeekClientUtils(String endpoint, String apiKey) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
    }

    public String chatCompletion(List<DeepSeekMessage> messages) throws UnirestException {
        DeepSeekRequest request = DeepSeekRequest.builder()
                .model("deepseek-chat")
                .messages(messages)
                .build();

        HttpResponse<String> response = Unirest.post(endpoint + "/chat/completions")
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .body(gson.toJson(request))
                .asString();

        return response.getBody();
    }
}