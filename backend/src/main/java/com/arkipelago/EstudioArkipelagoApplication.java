package com.arkipelago;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EstudioArkipelagoApplication {

    public static void main(String[] args) {
        SpringApplication.run(EstudioArkipelagoApplication.class, args);
    }
}
