package com.cems.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = @Index(name = "idx_audit_created", columnList = "created_at"))
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @Column(length = 40)
    private String id;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(nullable = false, length = 120)
    private String actor;

    @Column(nullable = false, length = 60)
    private String action;

    @Column(name = "entity_name", nullable = false, length = 300)
    private String entity;
}
