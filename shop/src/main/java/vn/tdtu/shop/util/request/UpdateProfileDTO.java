package vn.tdtu.shop.util.request;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import vn.tdtu.shop.domain.User;
import vn.tdtu.shop.util.constant.GenderEnum;

@Getter
@Setter
public class UpdateProfileDTO {

    private long id;
    @NotBlank(message = "Username không được để trống")
    @Size(min = 5, max = 50, message = "Username phải có độ dài từ 5 đến 50 ký tự")
    private String name;
    @NotNull(message = "Gender không được để trống")
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;
    private String avatar;
    @NotBlank(message = "Phone không được để trống")
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;
    private String address;

    public UpdateProfileDTO() {
    }

    public UpdateProfileDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.gender = user.getGender();
        this.avatar = user.getAvatar();
        this.phone = user.getPhone();
        this.address = user.getAddress();
    }

}
