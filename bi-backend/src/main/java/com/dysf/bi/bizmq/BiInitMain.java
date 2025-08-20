package com.dysf.bi.bizmq;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

/**
 * 用于创建测试程序用到的交换机和队列（只用在程序启动前执行一次）
 */
public class BiInitMain {

    public static void main(String[] args) {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("182.92.181.38"); // RabbitMQ服务器地址
            factory.setUsername("admin"); // 替换为你的RabbitMQ用户名（如之前配置的admin）
            factory.setPassword("123456"); // 替换为该用户的密码
            // 可选：若端口不是默认5672，需指定端口
            // factory.setPort(5672);

            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();

            String EXCHANGE_NAME = BiMqConstant.BI_EXCHANGE_NAME;
            // 声明交换机（持久化、非自动删除）
            channel.exchangeDeclare(EXCHANGE_NAME, "direct", true, false, null);

            String queueName = BiMqConstant.BI_QUEUE_NAME;
            // 声明队列（持久化、非排他、非自动删除）
            channel.queueDeclare(queueName, true, false, false, null);
            // 绑定队列到交换机
            channel.queueBind(queueName, EXCHANGE_NAME, BiMqConstant.BI_ROUTING_KEY);

            // 执行成功后打印提示
            System.out.println("交换机、队列创建并绑定成功！");

            // 关闭资源
            channel.close();
            connection.close();
        } catch (Exception e) {
            e.printStackTrace(); // 打印异常，方便排查错误
        }
    }
}
