package com.gkhb.keyvehicle.service.etl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gkhb.keyvehicle.common.utils.DateUtils;
import com.gkhb.keyvehicle.exception.DtpException;
import com.gkhb.keyvehicle.mapper.HistDataMapper;
import com.gkhb.keyvehicle.mapper.RealTimeDataMapper;
import com.gkhb.keyvehicle.model.GPSData;
import com.gkhb.keyvehicle.model.HistData;
import com.gkhb.keyvehicle.model.RealTimeData;

/**
 * 数据清洗实现类
 * 
 * @author 张顺江
 * @createTime 2016年4月11日 下午12:31:10
 */
@Service("etlService")
public class EtlServiceImpl implements EtlService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EtlServiceImpl.class);

    @Autowired
    private InitDaemonThread initDaemonThreadService; // 初始化守护线程服务

    @Autowired
    private WarningEtlService warningEtlService;

    @Autowired
    private HistDataMapper histDataMapper;

    @Autowired
    private RealTimeDataMapper realTimeDataMapper;

    /*@Override
    public synchronized void GPSEtl() {
        try {
            long time1 = System.currentTimeMillis();
            // 获取实时表和历史表中未清洗数据
            List<RealTimeData> realTimeDataList = realTimeDataMapper.queryRealTimeDataByEtlState(0);
            List<HistData> histDataList = histDataMapper.queryHistDataByEtlState(0);
            List<GPSData> gpsDataList = new ArrayList<>();
            gpsDataList.addAll(realTimeDataList);
            gpsDataList.addAll(histDataList);
            // 进行清洗
            if (gpsDataList.size() > 0) {
                warningEtlService.warning(gpsDataList);
                warningEtlService.routeWarningEtl(gpsDataList);
                warningEtlService.timeWarningEtl(gpsDataList);
                warningEtlService.speedWarningEtl(gpsDataList);
                warningEtlService.fatigueDrivingWarningEtl(gpsDataList);
                // 修改实时表和历史表中状态清洗
                if (realTimeDataList != null && realTimeDataList.size() > 0) {
                    realTimeDataMapper.updateRealTimeDataToEtlState1(realTimeDataList);
                }
                if (histDataList != null && histDataList.size() > 0) {
                    histDataMapper.updateHistDataToEtlState1(histDataList);
                }
            LOGGER.info("etl 10000 data cost : " + (System.currentTimeMillis() - time1));
            }
//            LOGGER.info("etl 10000 data cost : " + (System.currentTimeMillis() - time1));
        } catch (Exception e) {
            LOGGER.error("GPSEtl", e);
        }
    }*/

    @Override
    public boolean moveGpsDataToHistoryTable() {
        // 获取当前时间EtlRunnableForGPS.java
//        String tempDate = DateUtils.formatDateToString(new Date(), "yyyy-MM-dd 00:00:00");
        Date newDate = null;
        try {
        	//获取当前时间的前一个小时时间
        	newDate = DateUtils.acquireTimeByTime(new Date(),  Calendar.MINUTE, 10, -1);
//            newDate = DateUtils.formatDate(tempDate + " " + "00:00:00", DateUtils.YYYY_MM_DD_HH_MM_SS);
        } catch (NumberFormatException | DtpException e1) {
            LOGGER.error("formatDate is error :", e1);
            return false;
        }
        // 查询实时表中前一天数据
        List<RealTimeData> realTimeDataList = realTimeDataMapper.queryRealTimeDataByTime(newDate);
        // 添加历史表中前一天数据
        if (realTimeDataList != null && realTimeDataList.size() > 0) {
        	for (int i = 0; i < realTimeDataList.size(); i++) {
        		RealTimeData rtd = new RealTimeData();
        		rtd.setId(realTimeDataList.get(i).getId());
        		rtd.setSystemNumber(realTimeDataList.get(i).getSystemNumber());
        		rtd.setPlateNumber(realTimeDataList.get(i).getPlateNumber());
        		rtd.setWarnFlag(realTimeDataList.get(i).getWarnFlag());
        		rtd.setState(realTimeDataList.get(i).getState());
        		rtd.setLatitude(realTimeDataList.get(i).getLatitude());
        		rtd.setLongitude(realTimeDataList.get(i).getLongitude());
        		rtd.setAltitude(realTimeDataList.get(i).getAltitude());
        		rtd.setSpeed(realTimeDataList.get(i).getSpeed());
        		rtd.setCourse(realTimeDataList.get(i).getCourse());
        		rtd.setReportTime(realTimeDataList.get(i).getReportTime());
        		rtd.setReceiveTime(realTimeDataList.get(i).getReceiveTime());
        		rtd.setEtlState(realTimeDataList.get(i).getEtlState());

        		histDataMapper.addHistDataBatch(rtd);
			}
            
        }
        // 删除实时表中前一天数据
        realTimeDataMapper.deleteRealTimeDataByTime(newDate);
        return true;
    }
}
