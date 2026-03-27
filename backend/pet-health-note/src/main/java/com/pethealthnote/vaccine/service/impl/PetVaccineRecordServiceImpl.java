package com.pethealthnote.vaccine.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.vaccine.entity.PetVaccineRecord;
import com.pethealthnote.vaccine.mapper.PetVaccineRecordMapper;
import com.pethealthnote.vaccine.service.PetVaccineRecordService;
import org.springframework.stereotype.Service;

@Service
public class PetVaccineRecordServiceImpl extends ServiceImpl<PetVaccineRecordMapper, PetVaccineRecord>
        implements PetVaccineRecordService {
}


