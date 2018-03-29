package com.gkhb.keyvehicle.model;

import java.util.Date;

/**
 *	预警信息表
 *	@author weidongping
 *	@createTime 2017年9月7日 上午10:27:02
 */
public class EarlyWarningInfo {
	/**
	 * 主键id
	 */
	private String id;
	/**
	 * 车辆id
	 */
	private String vehicleId;
	/**
	 * 预警类型
	 */
	private String warningType;
	/**
	 * 预警开始时间
	 */
	private Date warningStartTime;
	/**
	 * 预警开始位置
	 */
	private String warningStartLocation;
	/**
	 * 预警结束时间
	 */
	private Date warningEndTime;
	/**
	 * 预警结束位置
	 */
	private String warningEndLocation;
	/**
	 * 状态
	 */
	private int state;
	/**
	 * 行驶速度
	 */
	private double speed; 
	/**
	 * 违反阀值id
	 */
	private String warningSetId; 
	/**
	 * 车牌号码
	 */
	private String plateNumber; 
	/**
	 * 路段名
	 */
	private String roadName; 
	/**
	 * 处置方式
	 */
	private String disposalWay; 
	/**
	 * 预警坐标集
	 */
	private String warnGpsData; 
	/**
	 * 预警规则名称
	 */
	private String warningRuleName; 
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getVehicleId() {
		return vehicleId;
	}
	public void setVehicleId(String vehicleId) {
		this.vehicleId = vehicleId;
	}
	public String getWarningType() {
		return warningType;
	}
	public void setWarningType(String warningType) {
		this.warningType = warningType;
	}
	public Date getWarningStartTime() {
		return warningStartTime;
	}
	public void setWarningStartTime(Date warningStartTime) {
		this.warningStartTime = warningStartTime;
	}
	public String getWarningStartLocation() {
		return warningStartLocation;
	}
	public void setWarningStartLocation(String warningStartLocation) {
		this.warningStartLocation = warningStartLocation;
	}
	public Date getWarningEndTime() {
		return warningEndTime;
	}
	public void setWarningEndTime(Date warningEndTime) {
		this.warningEndTime = warningEndTime;
	}
	public String getWarningEndLocation() {
		return warningEndLocation;
	}
	public void setWarningEndLocation(String warningEndLocation) {
		this.warningEndLocation = warningEndLocation;
	}
	public int getState() {
		return state;
	}
	public void setState(int state) {
		this.state = state;
	}
    public double getSpeed() {
        return speed;
    }
    public void setSpeed(double speed) {
        this.speed = speed;
    }
    public String getWarningSetId() {
        return warningSetId;
    }
    public void setWarningSetId(String warningSetId) {
        this.warningSetId = warningSetId;
    }
	public String getPlateNumber() {
		return plateNumber;
	}
	public void setPlateNumber(String plateNumber) {
		this.plateNumber = plateNumber;
	}
	public String getRoadName() {
		return roadName;
	}
	public void setRoadName(String roadName) {
		this.roadName = roadName;
	}
	public String getDisposalWay() {
		return disposalWay;
	}
	public void setDisposalWay(String disposalWay) {
		this.disposalWay = disposalWay;
	}
	public String getWarnGpsData() {
		return warnGpsData;
	}
	public void setWarnGpsData(String warnGpsData) {
		this.warnGpsData = warnGpsData;
	}
	public String getWarningRuleName() {
		return warningRuleName;
	}
	public void setWarningRuleName(String warningRuleName) {
		this.warningRuleName = warningRuleName;
	}
	
	
	
	

}



 