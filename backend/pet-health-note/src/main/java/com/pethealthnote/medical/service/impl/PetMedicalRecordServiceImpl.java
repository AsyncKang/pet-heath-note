package com.pethealthnote.medical.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.medical.entity.PetMedicalRecord;
import com.pethealthnote.medical.mapper.PetMedicalRecordMapper;
import com.pethealthnote.medical.service.PetMedicalRecordService;
import org.springframework.stereotype.Service;

@Service
public class PetMedicalRecordServiceImpl extends ServiceImpl<PetMedicalRecordMapper, PetMedicalRecord>
        implements PetMedicalRecordService {
}


