package com.cems.service;

import com.cems.dto.AuditLogDto;
import com.cems.model.AuditLog;
import com.cems.repository.AuditLogRepository;
import com.cems.util.Ids;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository repository;
    private final DtoMapper mapper;

    public AuditService(AuditLogRepository repository, DtoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public void log(String actor, String action, String entity) {
        AuditLog entry = new AuditLog();
        entry.setId(Ids.next("log"));
        entry.setCreatedAt(Instant.now());
        entry.setActor(truncate(actor, 120));
        entry.setAction(truncate(action, 60));
        entry.setEntity(truncate(entity, 300));
        repository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> recent() {
        return repository.findTop200ByOrderByCreatedAtDesc().stream().map(mapper::audit).toList();
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
