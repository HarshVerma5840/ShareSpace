package com.sharespace.backend.spot;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, Long> {
    List<Spot> findAllByOrderByCreatedAtDesc();
    List<Spot> findByHostIdOrderByCreatedAtDesc(Long hostId);
}
