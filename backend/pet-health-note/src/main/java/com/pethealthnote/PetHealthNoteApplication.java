package com.pethealthnote;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.pethealthnote.**.mapper")
@EnableScheduling
public class PetHealthNoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetHealthNoteApplication.class, args);
    }
}


