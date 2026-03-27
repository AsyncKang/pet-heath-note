package com.pethealthnote.health.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.health.entity.PetHealthRecord;
import com.pethealthnote.health.mapper.PetHealthRecordMapper;
import com.pethealthnote.health.service.PetHealthRecordService;
import org.springframework.stereotype.Service;

@Service
public class PetHealthRecordServiceImpl extends ServiceImpl<PetHealthRecordMapper, PetHealthRecord> implements PetHealthRecordService {
}


