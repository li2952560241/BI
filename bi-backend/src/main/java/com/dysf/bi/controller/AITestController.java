package com.dysf.bi.controller;


import com.dysf.bi.model.dto.ai.DeeseekRequest;
import com.google.gson.Gson;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RequestMapping("/AI")
@RestController
public class AITestController {
 
    private final Gson gson = new Gson();
   
 
    @PostMapping("test1")
    public String tallQuestion(@org.springframework.web.bind.annotation.RequestBody String question) throws IOException, UnirestException {
 
        Unirest.setTimeouts(0, 0);
 
//DeeseekRequest: 自己的实体类名称
 
        List<DeeseekRequest.Message> messages = new ArrayList<>();
//给deepSeek一个角色 系统预设
        messages.add(DeeseekRequest.Message.builder().role("system").content("你是一个数据分析师和前端开发专家，接下来我会按照以下固定格式给你提供内容：\\n\" +\n" +
                "                \"分析需求：\\n\" +\n" +
                "                \"{数据分析的需求或者目标}\\n\" +\n" +
                "                \"原始数据：\\n\" +\n" +
                "                \"{csv格式的原始数据，用,作为分隔符}\\n\" +\n" +
                "                \"请根据这两部分内容，按照以下指定格式生成内容（此外不要输出任何多余的开头、结尾、注释）\\n\" +\n" +
                "                \"【【【【【\\n\" +\n" +
                "                \"{前端 Echarts V5 的 option 配置对象js代码（输出 json 格式），合理地将数据进行可视化，不要生成任何多余的内容，比如注释}\\n\" +\n" +
                "                \"【【【【【\\n\" +\n" +
                "                \"{明确的数据分析结论、越详细越好，不要生成多余的注释}\\n\" +\n" +
                "                \"【【【【【\"").build());
 
// question：说你自己想说的话
        messages.add(DeeseekRequest.Message.builder().role("user").content(question).build());
 
        DeeseekRequest requestBody = DeeseekRequest.builder()
                .model("deepseek-chat")
                .messages(messages)
                .build();
        HttpResponse<String> response = Unirest.post("https://api.deepseek.com/chat/completions")
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Authorization", "Bearer "+"sk-c46ea531d5c44dcd89802839f3ae8075")
                .body(gson.toJson(requestBody))
               .asString();
        return  response.getBody();
 
    }
}