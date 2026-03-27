package com.pethealthnote.common;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PageResponse<T> {

    private long total;
    private long page;
    private long size;
    private List<T> records;
}


