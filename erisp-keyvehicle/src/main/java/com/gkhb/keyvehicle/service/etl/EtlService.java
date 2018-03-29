package com.gkhb.keyvehicle.service.etl;

/**
 * 信达数据清洗服务类
 * 
 * @author 张顺江
 * @createTime 2016年4月11日 上午11:05:36
 */
public interface EtlService {

    /**
     * 清洗GPS数据
     */
//    public void GPSEtl();

    /**
     * 转移GPS数据实时表中数据到历史表中
     */
    public boolean moveGpsDataToHistoryTable();

}
