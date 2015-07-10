#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import sys

target_dir_path = sys.argv[1]
suffix = sys.argv[2]

for f in os.listdir(target_dir_path):
    print f[:-13]
    if f[:-13] != suffix:
        continue
    old_path = os.path.join(target_dir_path,f)
    new_path = os.path.join(target_dir_path,suffix)
    
    os.rename(old_path,new_path)
