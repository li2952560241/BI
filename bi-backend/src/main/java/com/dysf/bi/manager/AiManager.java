package com.dysf.bi.manager;


import com.dysf.bi.model.dto.ai.DeepSeekMessage;
import com.dysf.bi.utils.DeepSeekClientUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class AiManager {

    @Resource
    private DeepSeekClientUtils deepSeekClientUtils;

    private static final String SYSTEM_PROMPT = "你是一个数据分析师和前端开发专家，接下来我会按照以下固定格式给你提供内容：\n" +
            "分析需求：\n" +
            "{数据分析的需求或者目标}\n" +
            "原始数据：\n" +
            "{csv格式的原始数据，用,作为分隔符}\n" +
            "请根据这两部分内容，按照以下指定格式生成内容（此外不要输出任何多余的开头、结尾、注释）\n" +
            "【【【【【\n" +
            "{前端 Echarts V5 的 option 配置对象js代码（输出 json 格式），合理地将数据进行可视化，不要生成任何多余的内容，比如注释}\n" +
            "【【【【【\n" +
            "{明确的数据分析结论、越详细越好，不要生成多余的注释}\n" +
            "【【【【【";

    public String doChat(String userMessage) {
        try {
            List<DeepSeekMessage> messages = new ArrayList<>();
            messages.add(DeepSeekMessage.builder()
                    .role("system")
                    .content(SYSTEM_PROMPT)
                    .build());
            messages.add(DeepSeekMessage.builder()
                    .role("user")
                    .content(userMessage)
                    .build());
            
            return deepSeekClientUtils.chatCompletion(messages);
        } catch (Exception e) {
            log.error("AI 对话失败", e);
            throw new RuntimeException("AI 对话失败", e);
        }
    }
}