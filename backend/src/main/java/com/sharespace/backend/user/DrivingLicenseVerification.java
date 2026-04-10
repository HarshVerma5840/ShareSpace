package com.sharespace.backend.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "driving_license_verifications")
public class DrivingLicenseVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(nullable = false, length = 30)
    private String licenseNumberMasked;

    @Column(nullable = false, length = 255)
    private String frontDocumentPath;

    @Column(length = 255)
    private String backDocumentPath;

    @Column(nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getLicenseNumberMasked() {
        return licenseNumberMasked;
    }

    public void setLicenseNumberMasked(String licenseNumberMasked) {
        this.licenseNumberMasked = licenseNumberMasked;
    }

    public String getFrontDocumentPath() {
        return frontDocumentPath;
    }

    public void setFrontDocumentPath(String frontDocumentPath) {
        this.frontDocumentPath = frontDocumentPath;
    }

    public String getBackDocumentPath() {
        return backDocumentPath;
    }

    public void setBackDocumentPath(String backDocumentPath) {
        this.backDocumentPath = backDocumentPath;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }
}
