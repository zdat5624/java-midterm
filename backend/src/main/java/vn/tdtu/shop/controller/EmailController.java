package vn.tdtu.shop.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.tdtu.shop.service.EmailService;
import vn.tdtu.shop.util.annotation.ApiMessage;

@RestController
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @ApiMessage("Gửi email đơn giản thành công")
    @GetMapping("/api/email")
    public String sendSimpleEmail() {
        this.emailService.sendSimpleEmail();
        // this.emailService.sendEmailSync("zdat5624@gmail.com, "test send email",

        return "ok";
    }
}
