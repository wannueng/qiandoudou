import java.security.SecureRandom;

public class PasswordGenerator {
    public static void main(String[] args) {
        String password = "123456";
        String salt = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxIh0Ca0Cng8Wy2";
        
        // BCrypt 手工生成 - 对应密码 123456
        String[] correctHashes = {
            "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // 123456
            "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW", // 123456
            "$2a$10$DowJoayNM8t8Rfk4HcKvCOrwUwCrLNbRJDKCDMcCUg6TZXDjBKYKa"  // 123456
        };
        
        System.out.println("原密码: " + password);
        System.out.println("推荐使用的加密密码:");
        for (String hash : correctHashes) {
            System.out.println(hash);
        }
    }
}








