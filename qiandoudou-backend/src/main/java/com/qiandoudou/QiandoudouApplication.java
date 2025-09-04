package com.qiandoudou;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.qiandoudou.mapper")
@EnableAsync
@EnableScheduling
public class QiandoudouApplication {
    public static void main(String[] args) {
        SpringApplication.run(QiandoudouApplication.class, args);
    }
}
