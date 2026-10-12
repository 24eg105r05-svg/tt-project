package com.cems.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "venues")
@Getter
@Setter
@NoArgsConstructor
public class Venue {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, length = 20)
    private String status = "Active";
}
