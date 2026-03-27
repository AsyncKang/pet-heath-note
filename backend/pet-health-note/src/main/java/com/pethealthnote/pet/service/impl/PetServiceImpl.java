package com.pethealthnote.pet.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.mapper.PetMapper;
import com.pethealthnote.pet.service.PetService;
import org.springframework.stereotype.Service;

@Service
public class PetServiceImpl extends ServiceImpl<PetMapper, Pet> implements PetService {
}


