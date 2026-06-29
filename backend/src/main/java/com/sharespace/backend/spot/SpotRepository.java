package com.sharespace.backend.spot;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpotRepository extends JpaRepository<Spot, Long> {
    List<Spot> findAllByOrderByCreatedAtDesc();
    
    @Query(value = "SELECT * FROM spots s WHERE ST_DWithin(s.location\\:\\:geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)\\:\\:geography, :distanceMeters) ORDER BY s.created_at DESC", nativeQuery = true)
    List<Spot> findSpotsWithinDistance(@Param("lat") double lat, @Param("lng") double lng, @Param("distanceMeters") double distanceMeters);

    List<Spot> findByHostIdOrderByCreatedAtDesc(Long hostId);
    void deleteByHostId(Long hostId);
}
