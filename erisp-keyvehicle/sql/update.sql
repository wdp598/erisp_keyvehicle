-- add by touxin 20171112 预警规则增加车牌类型
ALTER TABLE "KV_DS_WRINING_RULE" ADD ( "VEHICLE_PLATE_TYPE" VARCHAR2(255) NULL  ) ;

-- add by wangxiaogang 20171101 车辆信息表增加入城证
ALTER TABLE "KV_VEHICLE_INFO" ADD ( "INTO_CITY_CARD" VARCHAR2(50) NULL  ) ;

-- add by touxin 20171116 预警规则名长度调整
ALTER TABLE "KV_DS_WRINING_RULE" MODIFY ( "NAME" VARCHAR2(255 BYTE) ) ;