package com.dysf.bi.config;

import com.dysf.bi.utils.DeepSeekClientUtils;
import com.mashape.unirest.http.Unirest;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "deepseek.client")
@Data
public class DeepSeekConfig {

    /**
     * DeepSeek API 端点
     */
    private String endpoint = "https://api.deepseek.com";

    /**
     * DeepSeek API 密钥
     */
    private String apiKey;

    /**
     * 请求超时时间(毫秒)
     */
    private int connectTimeout = 300000;

    /**
     * 响应超时时间(毫秒)
     */
    private int socketTimeout = 600000;

    @Bean
    public DeepSeekClientUtils deepSeekClient() {
        // 配置Unirest全局设置
        Unirest.setTimeouts(connectTimeout, socketTimeout);
        return new DeepSeekClientUtils(endpoint, apiKey);
    }
}