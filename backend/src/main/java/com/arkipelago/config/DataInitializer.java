package com.arkipelago.config;

import com.arkipelago.domain.*;
import com.arkipelago.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final WallPostRepository wallPostRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial Estudio Arkipelago users and projects...");

            User partner = userRepository.save(User.builder()
                    .email("partner@arkipelago.ph")
                    .passwordHash(passwordEncoder.encode("admin"))
                    .name("Arch. Principal Partner")
                    .role(Role.PARTNER)
                    .phoneNumber("+63 917 123 4567")
                    .hourlyRatePhp(new BigDecimal("2500.00"))
                    .build());

            User senior = userRepository.save(User.builder()
                    .email("architect@arkipelago.ph")
                    .passwordHash(passwordEncoder.encode("architect"))
                    .name("Arch. Senior Associate")
                    .role(Role.SENIOR_ARCHITECT)
                    .phoneNumber("+63 918 234 5678")
                    .hourlyRatePhp(new BigDecimal("1500.00"))
                    .build());

            userRepository.save(User.builder()
                    .email("junior@arkipelago.ph")
                    .passwordHash(passwordEncoder.encode("junior"))
                    .name("Arch. Junior Draftsman")
                    .role(Role.JUNIOR_ARCHITECT)
                    .phoneNumber("+63 919 345 6789")
                    .hourlyRatePhp(new BigDecimal("800.00"))
                    .build());

            userRepository.save(User.builder()
                    .email("contractor@arkipelago.ph")
                    .passwordHash(passwordEncoder.encode("contractor"))
                    .name("Engr. Site Contractor")
                    .role(Role.CONTRACTOR)
                    .assignedProjectCodes("CV-2024")
                    .phoneNumber("+63 920 456 7890")
                    .build());

            // Seed Architectural Projects
            projectRepository.save(Project.builder()
                    .code("MT-2024")
                    .name("Manila Tower Mixed-Use")
                    .clientName("Ayala Land Corp")
                    .status("active")
                    .contractAmountPhp(new BigDecimal("4500000.00"))
                    .schematicPct(15)
                    .designDevPct(20)
                    .contractDocsPct(35)
                    .biddingPct(5)
                    .constructionAdminPct(25)
                    .build());

            projectRepository.save(Project.builder()
                    .code("CV-2024")
                    .name("Casa Verde Biophilic Residence")
                    .clientName("Dr. & Arch. Santos")
                    .status("active")
                    .contractAmountPhp(new BigDecimal("1850000.00"))
                    .schematicPct(15)
                    .designDevPct(20)
                    .contractDocsPct(35)
                    .biddingPct(5)
                    .constructionAdminPct(25)
                    .build());

            projectRepository.save(Project.builder()
                    .code("SK-2025")
                    .name("Siargao Eco-Kite Resort")
                    .clientName("Pacific Drift Holdings")
                    .status("active")
                    .contractAmountPhp(new BigDecimal("2400000.00"))
                    .schematicPct(15)
                    .designDevPct(20)
                    .contractDocsPct(35)
                    .biddingPct(5)
                    .constructionAdminPct(25)
                    .build());

            // Seed Estudio Wall Announcement
            wallPostRepository.save(WallPost.builder()
                    .author(partner)
                    .authorName(partner.getName())
                    .authorRole(partner.getRole().name())
                    .title("Casa Verde BP 344 & Structural Approval Completed")
                    .content("All architectural sheet revisions for CV-2024 have been stamped and cleared for construction bidding. Great work team!")
                    .category("ANNOUNCEMENT")
                    .likesCount(4)
                    .build());

            log.info("Database seeding complete. Default login: partner@arkipelago.ph / admin");
        }
    }
}
